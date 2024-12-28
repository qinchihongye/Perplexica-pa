import toml
from fastapi import FastAPI
from multiprocessing import Process
from typing import List
import traceback
import random
import aiohttp
from loguru import logger
import time

# 读取 config.toml 文件
with open("config.toml", "r") as file:
    config = toml.load(file)

# 读取配置
retrieval_url = config["GENERAL"]["RETRIEVALURL"]


class Zhihuretrieve:
    """
    Retriever for AnAn Retrieval API.

    Args:
        api_key: you.com API key, if `YDC_API_KEY` is not set in the environment
        endpoint: you.com endpoints
        num_web_results: The max number of web results to return, must be under 20
        safesearch: Safesearch settings, one of "off", "moderate", "strict", defaults to moderate
        country: Country code, ex: 'US' for United States, see API reference for more info
        search_lang: (News API) Language codes, ex: 'en' for English, see API reference for more info
        ui_lang: (News API) User interface language for the response, ex: 'en' for English, see API reference for more info
        spellcheck: (News API) Whether to spell check query or not, defaults to True
    """

    def __init__(self, api_url,topN=3):
        """Init params."""
        self.api_url = api_url # 检索url
        self.topN = topN

    async def generate_params(self, query_str):
        params = {
            "query": query_str,
            # "record_id": record_id if record_id else str(uuid.uuid4())
            "datasetIds": [f"{time.time()}"],
            "topN": self.topN,
            "simThreshold": 0.0,
        }
        return params

    async def retrieve(self, query_str, time_out=10):
        """Retrieve."""
        params = await self.generate_params(query_str)

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_url,
                    json=params,
                    timeout=aiohttp.ClientTimeout(total=time_out),
                ) as response:
                    results = await response.json()

            # print(results)
            results = results["content_list"]

            if not isinstance(results, list):
                logger.warning(f"Unexpected retrieval response format: {results}")
                results = []
            img_src_base = "https://pica.zhimg.com/50/v2-c825a4bfd9a4a99b32d2af6e2805347a_720w.gif?source=1def8aca"

            first_frame_base = "https://pica.zhimg.com/50/v2-c825a4bfd9a4a99b32d2af6e2805347a_720w.gif?source=1def8aca"

            new_nodes = []
            for doc in results:
                node_dict = {}
                try:
                    pictureUrls = eval(doc.get("pictureUrls"))
                except:
                    pictureUrls = []
                pictureUrls = [url for url in pictureUrls if url.startswith("http")] # 不是 http 开头的不要,空列表这行不报错
                pictureUrls = list(set(pictureUrls)) # 去重
                node_dict["query"] = query_str
                node_dict["title"] = doc["topic"]
                node_dict["content"] = doc["content"]
                node_dict["score"] = doc["score"]
                node_dict["length"] = doc["length"]
                node_dict["url"] = doc["url"]
                node_dict["img_src"] = (
                    img_src_base if len(pictureUrls) == 0 else random.choice(pictureUrls) # img_src_base if not doc.get("img_src") else doc.get("img_src")
                )
                node_dict["thumbnail_src"] = (
                    img_src_base if len(pictureUrls) == 0 else random.choice(pictureUrls) # img_src_base if not doc.get("thumbnail_src") else doc.get("thumbnail_src")
                )
                node_dict["thumbnail"] = (
                    img_src_base if len(pictureUrls) == 0 else random.choice(pictureUrls) # img_src_base if not doc.get("thumbnail") else doc.get("thumbnail")
                )
                node_dict["author"] = "" if not doc.get("author") else doc.get("author")
                node_dict["iframe_src"] = (
                    first_frame_base if len(pictureUrls) == 0 else random.choice(pictureUrls) # first_frame_baseif not doc.get("iframe_src") else doc.get("iframe_src")
                )
                new_nodes.append(node_dict)

        except Exception as e:
            new_nodes = []
            logger.error(f"Exception retrieval: {e} | {traceback.format_exc()}")

        return new_nodes
