import asyncio
import time
from functools import  wraps
from typing import Callable, Any, Optional
import datetime

# from aiocache import cached, SimpleMemoryCache
# from aiocache.serializers import JsonSerializer
# from loguru import logger
# from tenacity import retry as tenacity_retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import os
import json

def get_full_method_name(func: Callable, args: tuple) -> str:
    """
    获取完整的类名和方法名，格式为 'ClassName.method_name' 或 'function_name'。
    """
    if len(args) > 0 and hasattr(args[0], '__class__'):
        class_name = args[0].__class__.__name__
        method_name = func.__name__
        return f"{class_name}.{method_name}"
    else:
        return f"{func.__name__}"


# 定义全局的执行时间测量装饰器，支持同步和异步函数
def measure_time(func: Callable) -> Callable:
    """
    装饰器功能：记录函数的执行时间，无论是同步函数还是异步函数。

    示例输出：
       MyClass.my_method executed in 0.1234 seconds.
    """
    if asyncio.iscoroutinefunction(func):  # 检查是否是异步函数
        @wraps(func)
        async def async_wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            result = await func(*args, **kwargs)
            elapsed_time = (time.time() - start_time) * 1000  # 毫秒
            method_info = get_full_method_name(func, args)

            save_root = "./python_log"  # 固定文件夹
            save_path = os.path.join(save_root, f'{method_info}.json')

            current_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            time_interval_dict = {"current_time":current_time,"method_info": method_info,"request_body":kwargs.get("retrieval_body").dict(), "time_interval": elapsed_time}
            with open(save_path, mode='a', encoding='utf-8') as f:
                f.write(f'{json.dumps(time_interval_dict, ensure_ascii=False)}\n')

            # logger.info(f"{method_info} executed in {elapsed_time:.4f} millisecond.")
            return result

        return async_wrapper
    else:  # 若非异步函数
        @wraps(func)
        def sync_wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            result = func(*args, **kwargs)
            elapsed_time = (time.time() - start_time) * 1000  # 毫秒
            method_info = get_full_method_name(func, args)

            save_root = "./python_log"  # 固定文件夹
            save_path = os.path.join(save_root, f'{method_info}.json')

            current_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            time_interval_dict = {"current_time":current_time,"method_info": method_info,"request_body":kwargs.get("retrieval_body").dict(), "time_interval": elapsed_time}
            with open(save_path, mode='a', encoding='utf-8') as f:
                f.write(f'{json.dumps(time_interval_dict, ensure_ascii=False)}\n')

            # logger.info(f"{method_info} executed in {elapsed_time:.4f} millisecond.")
            return result

        return sync_wrapper

