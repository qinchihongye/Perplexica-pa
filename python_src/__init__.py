from fastapi import WebSocket

__all__ = ["active_websockets"]

active_websockets: list[WebSocket] = []