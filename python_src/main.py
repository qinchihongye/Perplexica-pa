import traceback
import json
import uuid

import toml
from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from multiprocessing import Process
from typing import List,Dict,Optional
from pydantic import BaseModel
from loguru import logger
import asyncio
import uvicorn

from util.base_util import remove_duplicates
from util.prompts import rewrite_query_prompt
from route.oneapi_llm import post_completions
from route.retrieve_base import Zhihuretrieve
from util.decorator_util import measure_time
from fileds.ws_message import Message


active_websockets: list[WebSocket] = []


# 读取 config.toml 文件
with open("config.toml", "r") as file:
    config = toml.load(file)

# 读取配置
retrieval_url = config["GENERAL"]["RETRIEVALURL"]
pyport = config["GENERAL"]["PYPORT"]
time_out = config["GENERAL"]["TIMEOUT"]
verify_token = config["GENERAL"]["VERIFYTOKEN"]


class QueryRequest(BaseModel):
    query_list: List[str]
    opts:Optional[Dict] = None
    token:str


# 创建两个 FastAPI 实例
app = FastAPI()


@app.websocket("/rewrite_retrieval")  # WebSocket 接口
@measure_time
async def retrieval_ws(websocket: WebSocket):
    global active_websockets
    try:
        await websocket.accept()
        active_websockets.append(websocket)
        try:
            while True:
                # 等待客户端发送消息或连接关闭
                await websocket.receive_text()
        except WebSocketDisconnect:
            # 当WebSocket连接关闭时，从活跃连接列表中移除
            if active_websockets:
                active_websockets.remove(websocket)
    except Exception as e:
        print(f"{e}:{traceback.format_exc()}")


@app.get("/health")
async def healthcheck():
    return {"message": "success"}


# query改写router
@app.post("/rewrite_query")
@measure_time
async def rewrite(rewrite_body: QueryRequest):
    try:
        # 鉴权
        token = rewrite_body.token
        if token != verify_token:
            logger.error(f"token verify error")
            return {"code": -1, "error": "token verify error"}
        logger.info(f"鉴权成功: body of query: {rewrite_body}")

        query = rewrite_body.query_list[0]

        # 改写
        rewrite_query_prompt_new = rewrite_query_prompt.format(query, query)
        query_list = await post_completions(rewrite_query_prompt_new)
        query_combine = [query_str for query_str in json.loads(query_list)]
        return {"message": "success", "query_combine": query_combine}
    except Exception as e:
        logger.error(f"{e}: {traceback.format_exc}")
        return {"code": -1, "error": f"{e}: {traceback.format_exc}"}


async def notify_data_change(new_data: dict):
    global active_websockets
    # 遍历所有活跃的WebSocket连接并发送新数据
    disconnected_websockets = []
    for ws in active_websockets:
        try:
            try:
                logger.info(f"发送消息:{new_data.get('message')}")
            except:
                pass
            await ws.send_text(json.dumps(new_data, ensure_ascii=False))
        except Exception as e:
            # 如果发送失败，可能是因为连接已关闭
            disconnected_websockets.append(ws)
            logger.error(f"连接失败：{e}")

    # 移除所有已断开的连接
    # for ws in disconnected_websockets:
        # active_websockets.remove(ws)


@app.post("/retrieval")
@measure_time
async def retrieval(retrieval_body: QueryRequest):
    # 鉴权
    token = retrieval_body.token
    if token != verify_token:
        logger.error(f"token verify error")
        return {"code": -1, "error": "token verify error"}

    chat_id = str(uuid.uuid4())
    logger.info(f"鉴权成功: body of query: {retrieval_body}")
    query = retrieval_body.query_list[0]
    opts = retrieval_body.opts

    # 改写+检索
    if opts.get("language") == "en": # 走普通检索，普通检索中 {"query_list": ["如何选择终身寿险"],"opts": {"language": "en"}}
        logger.info(f"正在走 普通检索 !!!!!!!!!!!!!!!!!")
        try:
            """query 改写"""
            rewrite_query_prompt_new = rewrite_query_prompt.format(query, query)
            query_list = await post_completions(rewrite_query_prompt_new)
            query_combine = [query_str for query_str in eval(query_list)]
            await notify_data_change(
                Message(
                    message="改写", results=query_combine, end_flag=0, chat_id=chat_id
                ).dict()
            )

            """异步检索"""
            query_list = query_combine
            logger.info(f"query list to retrieval: {query_list}")
            retrieve_class = Zhihuretrieve(api_url=retrieval_url,topN=3)

            total_results = []
            #### 使用 asyncio.gather 并发执行多个异步任务
            tasks = [
                retrieve_class.retrieve(query_str=sub_query, time_out=time_out) for sub_query in query_list
            ]
            #### 逐个处理任务结果并发送给客户端,在处理完每个任务后立即将结果通过 websocket.send_json() 发送给客户端
            for task in asyncio.as_completed(tasks):
                result = await task
                total_results += result
                if result:
                    await asyncio.sleep(1)
                    logger.info(f"已检索：'{result[0]}'")
                    await notify_data_change(
                        Message(
                            message="检索",
                            results=result,
                            end_flag=0,
                            query=result[0]["query"],
                            chat_id=chat_id,
                            suggestions=[],
                        ).dict()
                    )
            #### 去重
            final_nodes = remove_duplicates(total_results)
            #### 在所有任务完成后，发送最终的汇总结果给客户端。发送最终的汇总结果
            await notify_data_change(
                Message(
                    message="去重",
                    results=final_nodes,
                    end_flag=1,
                    chat_id=chat_id,
                    suggestions=[],
                ).model_dump_json()
            )

            return {"results": final_nodes, "suggestions": []}

        except Exception as e:
            msg = {"code": -1, "error": f"{e}: {traceback.format_exc()}"}
            await notify_data_change(msg)
            return msg
        finally:
            await asyncio.sleep(1.5)
            await notify_data_change({"end_flag": 1, "chat_id": chat_id})

    elif opts.get("engines") in [["bing images","google images"],["youtube"]]: # 图片，视频检索
        logger.info(f"正在走 图片-视频检索!!!!!!!!!!!!!!!!!")
        try:
            retrieve_class = Zhihuretrieve(api_url=retrieval_url,topN=9) # 图片，视频搜索9个
            # 检索
            node_list = await  retrieve_class.retrieve(query_str=query,time_out=time_out)
            # node去重
            final_nodes = remove_duplicates(node_list)

            return {"results": final_nodes, "suggestions": []}
        
        except Exception as e:
            return {"code": -1, "error": f"{e}: {traceback.format_exc()}"}

    elif opts.get("engines") in [["bing news"]]: # discovery
        logger.info(f"正在走 discovery检索 !!!!!!!!!!!!!!!!!")
        try:
            retrieve_class = Zhihuretrieve(api_url=retrieval_url,topN=9) # 注意discovery会请求6次
            # 检索
            node_list = await  retrieve_class.retrieve(query_str=query,time_out=time_out)
            # node去重
            final_nodes = remove_duplicates(node_list)

            return {"results": final_nodes, "suggestions": []}
        except Exception as e:
            return {"code": -1, "error": f"{e}: {traceback.format_exc()}"}
    
    else:
        logger.error(f"请求体错误: {retrieval_body}")
        return {"code":-1,"error":"请求体错误"}


# 启动应用
if __name__ == "__main__":
    import platform
    sys_name = platform.system()
    number_of_workers = 4 if sys_name=='Linux' else 1
    uvicorn.run('main:app', host="0.0.0.0", port=pyport, workers=1, reload = False)
