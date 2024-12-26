from typing import Optional, List, Any, Literal, Union, Dict

from pydantic import BaseModel


class Message(BaseModel):
    message: str
    results: Optional[Union[List, Dict]]
    end_flag: Literal[0, 1]
    chat_id: str
    # suggestions: Optional[Union[List, None]] = None
    query: Optional[Union[str, None]] = None
    code: Optional[Union[int, None]] = 0
    error: Optional[Union[str, None]] = None
