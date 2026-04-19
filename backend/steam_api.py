import httpx
import os

# Твой API ключ Steam. В идеале его лучше держать в .env файле
STEAM_API_KEY = os.getenv("STEAM_API_KEY")


async def get_player_games(steam_id: str):
    """
    Получает список игр пользователя.
    """
    url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
    params = {
        "key": STEAM_API_KEY,
        "steamid": steam_id,
        "format": "json",
        "include_appinfo": True,  # Чтобы были названия и иконки игр
        "include_played_free_games": True
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Ошибка Steam API (Games): {e}")
            return None


async def get_player_achievements(steam_id: str, app_id: int):
    """
    Получает достижения игрока для конкретной игры на русском языке.
    """
    url = "http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/"
    params = {
        "appid": app_id,
        "key": STEAM_API_KEY,
        "steamid": steam_id,
        "l": "russian",  # Устанавливаем русский язык для названий и описаний
        "format": "json"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, timeout=10.0)
            if response.status_code == 400:
                # Часто бывает, если у игры нет достижений
                return None

            response.raise_for_status()
            data = response.json()

            # Проверяем, есть ли данные в ответе
            if "playerstats" in data and "achievements" in data["playerstats"]:
                return data
            return None

        except Exception as e:
            print(f"Ошибка Steam API (Achievements): {e}")
            return None
