import os
import requests
import motor.motor_asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

# Инициализация приложения
app = FastAPI(
    title="Консоль достижений STEAM v2.0",
    description="Информационная система учета достижений пользователей | Бибов Д.Р. | ИСП-40",
    version="2.0"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Чтение ключей из переменных окружения
STEAM_API_KEY = os.getenv("STEAM_API_KEY")
MONGO_URL = os.getenv("MONGO_URL")

# Подключение к MongoDB
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.steam_database  # Название базы данных

@app.get("/", tags=["Системные"])
async def read_root():
    return {"status": "online", "project": "Steam Achievements Console v2.0"}

@app.get("/steam/games/{steam_id}", tags=["Steam API"])
async def get_games(steam_id: str):
    url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={STEAM_API_KEY}&steamid={steam_id}&format=json&include_appinfo=true"
    try:
        response = requests.get(url)
        data = response.json()
        if not data.get("response"):
            raise HTTPException(status_code=404, detail="Пользователь не найден или профиль скрыт")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/steam/achievements/{steam_id}/{app_id}", tags=["Steam API"])
async def get_achievements(steam_id: str, app_id: int):
    url = f"http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid={app_id}&key={STEAM_API_KEY}&steamid={steam_id}&l=russian"
    try:
        response = requests.get(url)
        data = response.json()

        if "playerstats" in data:
            # ЛОГИКА СОХРАНЕНИЯ В БАЗУ
            ach_list = data["playerstats"].get("achievements", [])
            unlocked = len([a for a in ach_list if a.get("achieved") == 1])
            total = len(ach_list)
            
            if total > 0:
                # Записываем данные игрока в коллекцию top_players
                await db.top_players.update_one(
                    {"steam_id": steam_id, "app_id": str(app_id)},
                    {"$set": {
                        "steam_id": steam_id,
                        "app_id": str(app_id),
                        "achievements_unlocked": unlocked,
                        "total_achievements": total
                    }},
                    upsert=True
                )

        if "playerstats" not in data:
            raise HTTPException(status_code=404, detail="Данные о достижениях не найдены")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats/top/{app_id}", tags=["База Данных"])
async def get_game_top(app_id: str):
    """Получение реального списка лидеров из MongoDB"""
    try:
        # Ищем игроков по app_id, сортируем по количеству открытых (unlocked) сверху вниз
        cursor = db.top_players.find({"app_id": str(app_id)}).sort("achievements_unlocked", -1).limit(10)
        top_list = await cursor.to_list(length=10)
        
        for item in top_list:
            item.pop("_id", None)  # Удаляем системный ID MongoDB
            
        return top_list
    except Exception as e:
        return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
