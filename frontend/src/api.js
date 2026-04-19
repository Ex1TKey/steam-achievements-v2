const API_URL = "http://127.0.0.1:8000";

export const getSteamGames = async (steamId) => {
  const response = await fetch(`${API_URL}/steam/games/${steamId}`);
  return await response.json();
};

export const getPlayerAchievements = async (steamId, appId) => {
  // ВАЖНО: путь должен совпадать со скриншотом /steam/achievements/{steam_id}/{app_id}
  const response = await fetch(`${API_URL}/steam/achievements/${steamId}/${appId}`);
  return await response.json();
};

export const getGameTop = async (appId) => {
  // ВАЖНО: путь /stats/top/{app_id}
  const response = await fetch(`${API_URL}/stats/top/${appId}`);
  return await response.json();
};