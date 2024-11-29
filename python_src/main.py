import toml
from fastapi import FastAPI
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
with open('config.toml', 'r') as file:
    config = toml.load(file)

# 读取配置
retrieval_url = config['GENERAL']['RETRIEVALURL']
pyport = config['GENERAL']['PYPORT']
time_out = config['GENERAL']['TIMEOUT']


class Query(BaseModel):
    query:str


class QueryRequest(BaseModel):
    query_list: List[str]

# 创建两个 FastAPI 实例
app = FastAPI()

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
        query_combine = [
            query_str for query_str in eval(query_list)
        ]
        return {"message": "success", "query_combine": query_combine}
    except Exception as e:
        return {"code": -1, "error": e}

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


@app.post("/retrieval")
@measure_time
async def retrieval(query_list: QueryRequest):
    try:
        logger.info(f"body of query_list: {query_list.query_list}")
        retrieve_class = Zhihuretrieve(retrieval_url)

        # 使用 asyncio.gather 并发执行多个异步任务
        tasks = [retrieve_class.retrieve(sub_query,time_out) for sub_query in query_list.query_list]
        results = await asyncio.gather(*tasks)
        # logger.info(f"results: {results}")
        # 将所有结果合并到一个列表中
        node_list = [node for sublist in results for node in sublist]

        # node去重操作
        final_nodes = remove_duplicates(node_list)

        return {"results": final_nodes, "suggestions": []}
    except Exception as e:
        return {"code": -1, "error": str(e)}


# 启动应用
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=pyport)