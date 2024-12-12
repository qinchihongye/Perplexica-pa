import traceback
import json
import uuid

import toml
from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from multiprocessing import Process
from typing import List
from pydantic import BaseModel

from util.base_util import remove_duplicates
from util.prompts import rewrite_query_prompt
from route.oneapi_llm import post_completions
from route.retrieve_base import Zhihuretrieve
import uvicorn
from util.decorator_util import measure_time
from loguru import logger
import asyncio

# 读取 config.toml 文件
with open("config.toml", "r") as file:
    config = toml.load(file)

# 读取配置
retrieval_url = config["GENERAL"]["RETRIEVALURL"]
pyport = config["GENERAL"]["PYPORT"]
time_out = config["GENERAL"]["TIMEOUT"]


class Query(BaseModel):
    query: str


class QueryRequest(BaseModel):
    query_list: List[str]


# 创建两个 FastAPI 实例
app = FastAPI()


@app.websocket("/rewrite_retrieval")  # WebSocket 接口
@measure_time
async def retrieval_ws(websocket: WebSocket):
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
async def rewrite(query: Query):
    try:
        rewrite_query_prompt_new = rewrite_query_prompt.format(query, query)
        query_list = await post_completions(rewrite_query_prompt_new)
        query_combine = [query_str for query_str in json.loads(query_list)]
        return {"message": "success", "query_combine": query_combine}
    except Exception as e:
        logger.error(f"{e}: {traceback.format_exc}")
        return {"code": -1, "error": f"{e}: {traceback.format_exc}"}


# query检索召回 节点
# @app.post("/retrieval")
# @measure_time
# async def retrieval(query_list: QueryRequest):
#     try:
#         logger.info(f"body of query_list: {query_list.query_list}")
#         retrieve_class = Zhihuretrieve(retrieval_url)
#         node_list = []
#         for sub_query_bundle in query_list.query_list:
#             nodes = await retrieve_class.retrieve(sub_query_bundle)
#             node_list.extend(nodes)

#         # node去重操作
#         final_nodes = remove_duplicates(node_list)

#         return {"results": final_nodes,"suggestions": []}
#     except Exception as e:
#         return {"code": -1, "error": e}


# @app.post("/retrieval")
# @measure_time
# async def retrieval(query_list: QueryRequest):
#     try:
#         logger.info(f"body of query_list: {query_list.query_list}")
#         retrieve_class = Zhihuretrieve(retrieval_url)

#         # 使用 asyncio.gather 并发执行多个异步任务
#         tasks = [
#             retrieve_class.retrieve(sub_query, time_out)
#             for sub_query in query_list.query_list
#         ]
#         results = await asyncio.gather(*tasks)
#         # logger.info(f"results: {results}")
#         # 将所有结果合并到一个列表中
#         node_list = [node for sublist in results for node in sublist]

#         # node去重操作
#         final_nodes = remove_duplicates(node_list)

#         return {"results": final_nodes, "suggestions": []}
#     except Exception as e:
#         return {"code": -1, "error": str(e)}


active_websockets: list[WebSocket] = []


async def notify_data_change(new_data: dict):
    # 遍历所有活跃的WebSocket连接并发送新数据
    disconnected_websockets = []
    for ws in active_websockets:
        try:
            await ws.send_text(json.dumps(new_data, ensure_ascii=False))
        except Exception as e:
            # 如果发送失败，可能是因为连接已关闭
            disconnected_websockets.append(ws)
            print(f"连接失败：{e}")

    # 移除所有已断开的连接
    for ws in disconnected_websockets:
        active_websockets.remove(ws)


@app.post("/retrieval")
@measure_time
async def retrieval(query_list: QueryRequest):
    try:
        chat_id = str(uuid.uuid4())
        logger.info(f"body of query: {query_list}")
        query = query_list.query_list[0]

        """query 改写"""
        rewrite_query_prompt_new = rewrite_query_prompt.format(query, query)
        query_list = await post_completions(rewrite_query_prompt_new)
        query_combine = [query_str for query_str in eval(query_list)]
        await notify_data_change(
            {
                "message": "改写",
                "results": query_combine,
                "end_flag": 0,
                "chat_id": chat_id,
            }
        )

        """异步检索"""
        query_list = query_combine
        logger.info(f"query list to retrieval: {query_list}")
        retrieve_class = Zhihuretrieve(retrieval_url)

        total_results = []
        #### 使用 asyncio.gather 并发执行多个异步任务
        tasks = [
            retrieve_class.retrieve(sub_query, time_out) for sub_query in query_list
        ]
        #### 逐个处理任务结果并发送给客户端,在处理完每个任务后立即将结果通过 websocket.send_json() 发送给客户端
        for task in asyncio.as_completed(tasks):
            result = await task
            total_results += result
            await notify_data_change(
                {
                    "message": "检索",
                    "results": result,
                    "suggestions": [],
                    "end_flag": 0,
                    "chat_id": chat_id,
                }
            )
        #### 去重
        final_nodes = remove_duplicates(total_results)
        #### 在所有任务完成后，发送最终的汇总结果给客户端。发送最终的汇总结果
        await notify_data_change(
            {
                "message": "去重",
                "results": final_nodes,
                "suggestions": [],
                "end_flag": 1,
                "chat_id": chat_id,
            }
        )

    except Exception as e:
        await notify_data_change({"code": -1, "error": str(e)})
    finally:
        await notify_data_change({"end_flag": 1, "chat_id": chat_id})
        return {"results": final_nodes, "suggestions": []}


# 启动应用
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=pyport)
