import { getSteamGames, getPlayerAchievements, getGameTop } from './api';
import React, { useState } from 'react';
import { Gamepad2, Search, Trophy, X, CheckCircle2, Circle, Filter, Users, List } from 'lucide-react';

function App() {
  const [steamId, setSteamId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedGame, setSelectedGame] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [modalTab, setModalTab] = useState('achievements');
  const [achLoading, setAchLoading] = useState(false);

  const handleSearch = async () => {
    if (!steamId) return;

    setLoading(true);
    setGames([]);
    try {
      const data = await getSteamGames(steamId);
      if (data?.response?.games) {
        setGames(data.response.games);
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error("Ошибка при поиске:", error);
      setGames([]);
    }
    setLoading(false);
  };

  const openAchievements = async (game) => {
    setSelectedGame(game);
    setModalTab('achievements');
    setAchLoading(true);
    setAchievements([]);
    try {
      const data = await getPlayerAchievements(steamId, game.appid);
      if (data?.playerstats?.achievements) {
        setAchievements(data.playerstats.achievements);
      }

      const topData = await getGameTop(game.appid);
      setTopPlayers(topData || []);

    } catch (error) {
      console.error("Ошибка загрузки данных");
    }
    setAchLoading(false);
  };

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#1b2838] text-white p-8 font-sans">
      {/* Шапка проекта */}
      <header className="text-center mb-12">
        <div className="flex justify-center items-center gap-4 mb-6">
          <div className="bg-[#66c0f4] p-3 rounded-xl shadow-[0_0_20px_rgba(102,192,244,0.3)]">
            <Trophy className="text-[#1b2838] w-10 h-10" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase">
            Мониторинг <span className="text-[#66c0f4]">Достижений</span> Steam
            <span className="ml-3 text-xs font-mono bg-[#66c0f4]/10 text-[#66c0f4] border border-[#66c0f4]/20 px-2 py-1 rounded">v2.0</span>
          </h1>
        </div>

        <div className="max-w-3xl mx-auto border-t border-b border-slate-700/50 py-6 mb-4">
          <p className="text-xl text-gray-300 font-light tracking-wide mb-5">
            Дипломный проект: <span className="text-white font-semibold">Разработка информационной системы учета достижений</span>
          </p>

          {/* ВОТ ЭТОТ БЛОК */}
          <div className="inline-flex flex-col items-center bg-[#2a475e]/30 px-10 py-4 rounded-2xl border border-slate-700 backdrop-blur-sm shadow-2xl">
            <span className="text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-2">Разработчик информационной системы</span>
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-[#66c0f4] animate-pulse shadow-[0_0_8px_#66c0f4]"></div>
              <p className="text-[#66c0f4] font-bold text-2xl tracking-tight">Бибов Даниил Русланович</p>
            </div>
            <p className="text-slate-400 text-sm mt-1 font-mono border-t border-slate-700/50 pt-1 w-full text-center">Группа: ИСП-40</p>
          </div>
        </div>
      </header>

      {/* Панель поиска */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 mb-16">
        <div className="flex-1 flex shadow-2xl rounded-md overflow-hidden ring-1 ring-slate-700">
          <input
            type="text"
            placeholder="Введите SteamID64"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-[#2a475e] border-none px-6 py-4 focus:bg-[#325674] outline-none transition-all text-lg placeholder:text-slate-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-[#66c0f4] hover:bg-[#417a9b] disabled:opacity-50 text-[#1b2838] px-8 py-4 font-bold flex items-center gap-2 transition-all active:scale-95"
          >
            {loading ? <div className="h-5 w-5 border-2 border-t-transparent rounded-full animate-spin"></div> : <Search size={20} />}
            <span className="uppercase tracking-wider">Найти</span>
          </button>
        </div>

        {games.length > 0 && (
          <div className="flex-1 relative flex items-center">
            <Filter className="absolute left-4 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Поиск по названию игры..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1b2838] border border-slate-700 rounded-md pl-12 pr-6 py-4 focus:border-[#66c0f4] outline-none transition-all"
            />
          </div>
        )}
      </div>

      {/* Сетка игр */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredGames.map((game) => (
          <div
            key={game.appid}
            onClick={() => openAchievements(game)}
            className="bg-[#2a475e]/40 hover:bg-[#2a475e] border border-slate-700/50 rounded-xl p-4 transition-all hover:-translate-y-2 cursor-pointer group shadow-lg"
          >
            <div className="relative overflow-hidden rounded-lg mb-4 aspect-video bg-[#171a21]">
              <img
                src={`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                alt={game.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x150?text=No+Image'; }}
              />
            </div>
            <h3 className="font-bold text-sm line-clamp-2 mb-4 group-hover:text-[#66c0f4] h-10 leading-snug">{game.name}</h3>
            <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-700/50 pt-3 mt-auto">
              <span className="bg-[#171a21] px-2 py-1 rounded-md text-[#66c0f4] font-medium uppercase tracking-tighter">
                {Math.round(game.playtime_forever / 60)} ч. в игре
              </span>
              <Gamepad2 size={16} className="opacity-40 group-hover:opacity-100 group-hover:text-[#66c0f4] transition-all" />
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1b2838] border border-slate-700 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-[#2a475e]/50">
              <div className="flex items-center gap-4">
                <div className="bg-[#66c0f4] p-2 rounded-lg">
                  <Trophy className="text-[#1b2838] w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">{selectedGame.name}</h2>
              </div>
              <button onClick={() => setSelectedGame(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={28} />
              </button>
            </div>

            {/* Табы */}
            <div className="flex bg-[#171a21] border-b border-slate-700">
              <button
                onClick={() => setModalTab('achievements')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-all ${modalTab === 'achievements' ? 'text-[#66c0f4] border-b-2 border-[#66c0f4] bg-[#2a475e]/20' : 'text-slate-500 hover:text-white'}`}
              >
                <List size={16}/> Достижения
              </button>
              <button
                onClick={() => setModalTab('top')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-all ${modalTab === 'top' ? 'text-[#66c0f4] border-b-2 border-[#66c0f4] bg-[#2a475e]/20' : 'text-slate-500 hover:text-white'}`}
              >
                <Users size={16}/> Топ игроков
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {achLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="w-12 h-12 border-4 border-[#66c0f4] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Загрузка...</p>
                </div>
              ) : modalTab === 'achievements' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.length > 0 ? achievements.map((ach, idx) => (
                    <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl border ${ach.achieved ? 'bg-[#66c0f4]/5 border-[#66c0f4]/20' : 'bg-slate-800/30 border-slate-700'}`}>
                      <div className="relative">
                        {ach.achieved ? <CheckCircle2 className="text-[#66c0f4] w-5 h-5 absolute -top-1 -right-1" /> : <Circle className="text-slate-600 w-5 h-5 absolute -top-1 -right-1" />}
                        <div className={`w-12 h-12 rounded bg-slate-700 flex items-center justify-center overflow-hidden ${!ach.achieved && 'grayscale opacity-40'}`}>
                           <Gamepad2 size={24} className="text-slate-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold text-sm ${ach.achieved ? 'text-[#66c0f4]' : 'text-slate-300'}`}>
                          {ach.name || ach.apiname}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-2">
                          {ach.description || "Описание скрыто или отсутствует"}
                        </p>
                      </div>
                    </div>
                  )) : <div className="text-center py-20 col-span-2 text-slate-500 italic">Достижения не найдены или скрыты</div>}
                </div>
              ) : (
                <div className="space-y-3">
                  {topPlayers.length > 0 ? topPlayers.map((player, i) => (
                    <div key={i} className={`flex justify-between items-center p-4 rounded-xl border ${player.steam_id === steamId ? 'bg-[#66c0f4]/10 border-[#66c0f4]/30' : 'bg-slate-800/20 border-slate-700'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#171a21] flex items-center justify-center text-[#66c0f4] font-bold border border-slate-700 text-xs">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-0.5">SteamID</p>
                          <p className="font-mono text-xs text-slate-300">{player.steam_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#66c0f4] font-bold text-xl leading-none">{player.achievements_unlocked}</p>
                        <p className="text-[10px] text-slate-500 uppercase mt-1">из {player.total_achievements}</p>
                      </div>
                    </div>
                  )) : <div className="text-center py-20 text-slate-500 italic text-sm">Список пуст</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;