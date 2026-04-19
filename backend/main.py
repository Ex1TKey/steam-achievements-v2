from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from typing import List, Optional

# Инициализация приложения с твоим названием
app = FastAPI(
    title="Консоль достижений STEAM v2.0",
    description="Информационная система учета достижений пользователей | Бибов Д.Р. | ИСП-40",
    version="2.0"
)

# Настройка CORS, чтобы React (localhost:3000) мог делать запросы
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене здесь будет адрес твоего сайта на Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Твой API Ключ Steam (рекомендую вынести в .env файл)
STEAM_API_KEY = "ТВОЙ_КЛЮЧ_STEAM"


@app.get("/", tags=["Системные"])
async def read_root():
    return {"status": "online", "project": "Steam Achievements Console v2.0"}


@app.get("/steam/games/{steam_id}", tags=["Steam API"])
async def get_games(steam_id: str):
    """Получение списка всех игр пользователя"""
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
    """Получение достижений конкретной игры для пользователя"""
    url = f"http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid={app_id}&key={STEAM_API_KEY}&steamid={steam_id}&l=russian"
    try:
        response = requests.get(url)
        data = response.json()

        # Здесь также можно добавить логику сохранения в MongoDB для формирования ТОПа

        if "playerstats" not in data:
            raise HTTPException(status_code=404, detail="Данные о достижениях не найдены")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats/top/{app_id}", tags=["База Данных"])
async def get_game_top(app_id: int):
    """Получение списка лидеров по конкретной игре из локальной БД"""
    # Здесь должна быть твоя логика работы с MongoDB (например, через motor или pymongo)
    # Ниже — пример заглушки, которую нужно заменить на реальный запрос к БД
    sample_top = [
        {"steam_id": "76561198769027509", "achievements_unlocked": 42, "total_achievements": 50},
        {"steam_id": "76561199160562383", "achievements_unlocked": 38, "total_achievements": 50}
    ]
    return sample_top


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)