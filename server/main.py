from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict

app = FastAPI()
connections: Dict[str, WebSocket] = {}

@app.websocket("/ws/{user}")
async def websocket_endpoint(ws: WebSocket, user: str):
    await ws.accept()
    connections[user] = ws
    try:
        while True:
            data = await ws.receive_json()
            target = data["to"]
            if target in connections:
                await connections[target].send_json({ **data, "from": user })
    except WebSocketDisconnect:
        del connections[user]