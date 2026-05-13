# -*- coding: utf-8 -*-
import asyncio
import random
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import uvicorn
import os

app = FastAPI()

CELL_SIZE = 20
WIDTH, HEIGHT = 640, 440

# Состояние игры
state = {
    "snake": [(200, 240), (180, 240), (160, 240)],
    "direction": (CELL_SIZE, 0),
    "apple": (400, 240),
    "score": 0,
    "fps": 6.0,
    "game_over": False
}

def spawn_apple():
    while True:
        x = random.randint(0, (WIDTH - CELL_SIZE) // CELL_SIZE) * CELL_SIZE
        y = random.randint(0, (HEIGHT - CELL_SIZE) // CELL_SIZE) * CELL_SIZE
        if (x, y) not in state["snake"]:
            return (x, y)

def reset_game():
    state["snake"] = [(200, 240), (180, 240), (160, 240)]
    state["direction"] = (CELL_SIZE, 0)
    state["score"] = 0
    state["fps"] = 6.0
    state["apple"] = spawn_apple()
    state["game_over"] = False

@app.get("/")
async def get_index():
    # Чтение HTML-файла из той же папки, где лежит скрипт
    with open(os.path.join(os.path.dirname(__file__), "index.html"), "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    reset_game()
    
    # Поток для чтения нажатий клавиш от игрока из браузера
    async def listen_input():
        try:
            while True:
                data = await websocket.receive_json()
                cmd = data.get("cmd")
                
                if state["game_over"] and cmd == "SPACE":
                    reset_game()
                    continue
                    
                curr_dir = state["direction"]
                # Проверка, чтобы змейка не могла развернуться в саму себя
                if cmd == "UP" and curr_dir[1] == 0:
                    state["direction"] = (0, -CELL_SIZE)
                elif cmd == "DOWN" and curr_dir[1] == 0:
                    state["direction"] = (0, CELL_SIZE)
                elif cmd == "LEFT" and curr_dir[0] == 0:
                    state["direction"] = (-CELL_SIZE, 0)
                elif cmd == "RIGHT" and curr_dir[0] == 0:
                    state["direction"] = (CELL_SIZE, 0)
        except WebSocketDisconnect:
            pass

    input_task = asyncio.create_task(listen_input())

    try:
        while True:
            if not state["game_over"]:
                # Логика движения головы змейки
                head_x, head_y = state["snake"][0]
                dir_x, dir_y = state["direction"]
                new_head = (head_x + dir_x, head_y + dir_y)

                # Проверка столкновения со стенами игрового поля или хвостом
                if (new_head[0] < 0 or new_head[0] >= WIDTH or new_head[1] < 0 or new_head[1] >= HEIGHT) or (new_head in state["snake"]):
                    state["game_over"] = True
                else:
                    state["snake"].insert(0, new_head)
                    # Если змейка съела яблоко
                    if new_head == state["apple"]:
                        state["score"] += 1
                        state["fps"] += 0.0001
                        state["apple"] = spawn_apple()
                    else:
                        state["snake"].pop()

            # Отправка текущих координат кадра рендера в браузер
            await websocket.send_json({
                "snake": state["snake"],
                "apple": state["apple"],
                "score": state["score"],
                "fps": state["fps"],
                "game_over": state["game_over"]
            })
            
            # Задержка шага игры на основе текущего FPS
            await asyncio.sleep(1 / state["fps"])
            
    except WebSocketDisconnect:
        print("Игрок отключился")
    finally:
        input_task.cancel()

if __name__ == "__main__":
    # Считываем динамический порт от Render или ставим 8000 для тестов локально
    port = int(os.environ.get("PORT", 8000))
    # Запуск сервера на внешнем интерфейсе 0.0.0.0, чтобы открыть доступ из сети
    uvicorn.run(app, host="0.0.0.0", port=port)
