import toml
from fastapi import FastAPI
from multiprocessing import Process
from typing import List
import traceback
import requests
import aiohttp
from loguru import logger

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

    def __init__(self, api_url):
        """Init params."""
        self.api_url = api_url

    async def generate_params(self, query_str):
        params = {
            "query": query_str,
            # "record_id": record_id if record_id else str(uuid.uuid4())
            "datasetIds": ["66159972e50601c600e26eb9"],
            "topN": 3,
            "simThreshold": 0.0,
        }
        return params

    async def retrieve(self, query_str, time_out=10):
        """Retrieve."""
        params = await self.generate_params(query_str)

        try:
            # response = requests.post(self.api_url, json=params, timeout=(1, 10))
            # response.raise_for_status()
            # results = response.json()
            # results = results['content_list']
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
            # img_src_base = [
            #     "https://image.baidu.com/search/detail?ct=503316480&z=0&ipn=d&word=%E7%9B%9B%E4%B8%96%E9%87%91%E8%B6%8A&step_word=&hs=0&pn=1&spn=0&di=7416423379248349185&pi=0&rn=1&tn=baiduimagedetail&is=0%2C0&istype=0&ie=utf-8&oe=utf-8&in=&cl=2&lm=-1&st=undefined&cs=3462955575%2C1761927637&os=492745426%2C290281889&simid=3462955575%2C1761927637&adpicid=0&lpn=0&ln=951&fr=&fmq=1732590935749_R&fm=&ic=undefined&s=undefined&hd=undefined&latest=undefined&copyright=undefined&se=&sme=&tab=0&width=undefined&height=undefined&face=undefined&ist=&jit=&cg=&bdtype=0&oriquery=&objurl=https%3A%2F%2Fstaticproxy.bxdaka.com%2Fbxdk_res%2Fmmbiz.qpic.cn%2Fmmbiz_jpg%2FVQeQnWKu3Cnd1b23nIK5Zv1GF77mib6icvCdj0iaI3PWiauQy2Qz1j1QtPYhiaSwVdOibn8ibQf9WxrR9mUxqAjWtw3rA%2F640&fromurl=ippr_z2C%24qAzdH3FAzdH3Fooo_z%26e3Bh7wt4jghj3t_z%26e3Bv54AzdH3FojkftpjAzdH3FwAzdH3FvG8PVz1Bk4MoZypWZV1MUnIaWUfxUTaluGE_z%26e3Bip4s&gsm=1e&rpstart=0&rpnum=0&islist=&querylist=&nojc=undefined&dyTabStr=MCwzLDEsMiwxMyw3LDYsNSwxMiw5&lid=10976332618528670132",
            #     "https://image.baidu.com/search/detail?ct=503316480&z=0&ipn=d&word=%E7%9B%9B%E4%B8%96%E9%87%91%E8%B6%8A&step_word=&hs=0&pn=86&spn=0&di=7416423379311263745&pi=0&rn=1&tn=baiduimagedetail&is=0%2C0&istype=0&ie=utf-8&oe=utf-8&in=&cl=2&lm=-1&st=undefined&cs=3533648401%2C25852144&os=43827091%2C4092115360&simid=3533648401%2C25852144&adpicid=0&lpn=0&ln=951&fr=&fmq=1732590935749_R&fm=&ic=undefined&s=undefined&hd=undefined&latest=undefined&copyright=undefined&se=&sme=&tab=0&width=undefined&height=undefined&face=undefined&ist=&jit=&cg=&oriquery=&objurl=https%3A%2F%2Ffile4.renrendoc.com%2Fview10%2FM03%2F2D%2F22%2FwKhkGWWt-IGAXCIBAAHrx9L0mIw372.jpg&gsm=78&rpstart=0&rpnum=0&islist=&querylist=&nojc=undefined&dyTabStr=MCwzLDEsMiwxMyw3LDYsNSwxMiw5&lid=10976332618528670132"]
            img_src_base = "http://www.kuaipng.com/Uploads/pic/w/2020/07-16/88964/water_88964_698_698_.png"

            first_frame_base = "http://i2.hdslb.com/bfs/archive/3fe4d87db7573fc74c8a39bd3a75f6660c1194ea.jpg"

            new_nodes = []
            for doc in results:
                node_dict = {}
                node_dict["query"] = query_str
                node_dict["title"] = doc["topic"]
                node_dict["content"] = doc["content"]
                node_dict["score"] = doc["score"]
                node_dict["length"] = doc["length"]
                node_dict["url"] = doc["url"]
                node_dict["img_src"] = (
                    img_src_base if not doc.get("img_src") else doc.get("img_src")
                )
                node_dict["thumbnail_src"] = (
                    img_src_base
                    if not doc.get("thumbnail_src")
                    else doc.get("thumbnail_src")
                )
                node_dict["thumbnail"] = (
                    img_src_base if not doc.get("thumbnail") else doc.get("thumbnail")
                )
                node_dict["author"] = "" if not doc.get("author") else doc.get("author")
                node_dict["iframe_src"] = (
                    first_frame_base
                    if not doc.get("iframe_src")
                    else doc.get("iframe_src")
                )
                new_nodes.append(node_dict)

        except Exception as e:
            new_nodes = []
            logger.error(f"Exception retrieval: {e} | {traceback.format_exc()}")

        return new_nodes
