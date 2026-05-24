import React, { useRef } from 'react';
import AnimalCard from './AnimalCard';
import DeadAnimalRow from './DeadAnimalRow';
import { STATUS_STYLES } from '../utils';

export default function Dashboard({
  cows,
  search,
  setSearch,
  filter,
  setFilter,
  section,
  setSection,
  onSelectCow,
  onOpenAdd,
  onImport,
  onExport,
  dark,
  onToggleDark,
  isSyncActive,
  onOpenSync
}) {
  const fileInputRef = useRef(null);

  // Divide cows
  const liveCows = cows.filter(c => c.status !== 'Öldü');
  const deadCows = cows.filter(c => c.status === 'Öldü');

  // Compute status counts for live cows
  const statusCounts = Object.keys(STATUS_STYLES)
    .filter(k => k !== 'Öldü')
    .reduce((acc, status) => {
      acc[status] = liveCows.filter(c => c.status === status).length;
      return acc;
    }, {});

  // Apply search and filter
  const getFilteredCows = () => {
    const pool = section === 'vefat' ? deadCows : liveCows;
    return pool.filter(c => {
      const q = search.toLowerCase();
      const matchQ =
        (c.name || '').toLowerCase().includes(q) ||
        c.tagNo.toLowerCase().includes(q);
      const matchF =
        section === 'vefat' || filter === 'Tümü' || c.status === filter;
      return matchQ && matchF;
    });
  };

  const filteredCows = getFilteredCows();

  const handleImportFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onImport(event.target.result);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-zinc-950 transition-colors duration-250 select-none pb-12">
      {/* ── HEADER & ACCENTED BANNER ── */}
      <div className="bg-gradient-to-br from-[#3d2200] via-[#7c5c2e] to-[#b8924a] dark:from-zinc-950 dark:via-[#1c1917] dark:to-zinc-900 p-6 shadow-lg relative">
        <div className="max-w-4xl mx-auto">
          {/* Top Header Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Title Block */}
            <div className="flex items-center gap-3">
              <span className="text-4xl animate-bounce duration-1000 select-none">🐄</span>
              <div>
                <h1 className="font-serif-playfair text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  Sürü Takip
                </h1>
                <p className="text-white/75 text-[11px] font-bold tracking-widest uppercase mt-0.5">
                  Çiftlik Yönetim Sistemi
                </p>
              </div>
            </div>

            {/* Actions: Import, Export, Darkmode, Add */}
            <div className="flex items-center flex-wrap justify-center gap-3 select-none">
              {/* Cloud Sync Button */}
              <button
                onClick={onOpenSync}
                title="Bulut Senkronizasyonu"
                className={`font-bold text-xs py-2 px-3 rounded-xl border flex items-center gap-1 transition-all shadow-sm ${
                  isSyncActive
                    ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-100 border-emerald-500/40 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/30'
                    : 'bg-white/10 hover:bg-white/20 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/60 text-white border-white/20 dark:border-zinc-700/50'
                }`}
              >
                <span>☁️</span> {isSyncActive ? 'Bulut Aktif' : 'Bulut Eşitle'}
              </button>

              {/* Import JSON */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Yedek Yükle (JSON)"
                className="bg-white/10 hover:bg-white/20 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/60 text-white font-bold text-xs py-2 px-3 rounded-xl border border-white/20 dark:border-zinc-700/50 flex items-center gap-1 transition-all"
              >
                📥 Yedek Yükle
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFileChange}
                className="hidden"
              />

              {/* Export JSON */}
              <button
                onClick={onExport}
                title="Yedek İndir (JSON)"
                className="bg-white/10 hover:bg-white/20 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/60 text-white font-bold text-xs py-2 px-3 rounded-xl border border-white/20 dark:border-zinc-700/50 flex items-center gap-1 transition-all"
              >
                📤 Yedek İndir
              </button>

              {/* Dark Mode toggle */}
              <button
                onClick={onToggleDark}
                title={dark ? 'Açık Tema' : 'Karanlık Tema'}
                className="bg-white/10 hover:bg-white/20 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/60 text-white font-bold text-sm p-2 rounded-xl border border-white/20 dark:border-zinc-700/50 transition-all cursor-pointer leading-none flex items-center justify-center"
              >
                {dark ? '☀️' : '🌙'}
              </button>

              {/* Add Animal Primary Button */}
              <button
                onClick={onOpenAdd}
                className="bg-white hover:bg-stone-100 dark:bg-[#7c5c2e] dark:hover:bg-[#b8924a] text-[#7c5c2e] dark:text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-md border-2 border-white/40 dark:border-zinc-650/40 transition-all transform hover:scale-[1.02] active:scale-98"
              >
                + Yeni İnek
              </button>
            </div>
          </div>

          {/* Quick Metrics stats Row */}
          <div className="flex flex-wrap gap-2.5 mt-6 select-none justify-start">
            <div className="bg-white/15 dark:bg-zinc-900/40 backdrop-blur-[3px] border border-white/10 dark:border-zinc-800 rounded-xl px-4 py-1.5 text-white flex items-center gap-1">
              <span className="text-[11px] opacity-75 font-semibold">Toplam:</span>
              <span className="font-extrabold text-sm">{liveCows.length}</span>
            </div>
            {Object.entries(statusCounts)
              .filter(([, val]) => val > 0)
              .map(([key, val]) => (
                <div
                  key={key}
                  className="bg-white/15 dark:bg-zinc-900/40 backdrop-blur-[3px] border border-white/10 dark:border-zinc-800 rounded-xl px-3.5 py-1.5 text-white flex items-center gap-2"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[key].dotClass}`}></span>
                  <span className="text-[11px] opacity-75 font-semibold">{key}:</span>
                  <span className="font-extrabold text-sm">{val}</span>
                </div>
              ))}
          </div>

          {/* Section Selector tabs ("Aktif Sürü" vs "Vefat Edenler") */}
          <div className="flex gap-2.5 mt-6 border-t border-white/10 dark:border-zinc-800/60 pt-5 select-none">
            {[
              { id: 'suru', label: '🐄 Aktif Sürü', count: liveCows.length },
              { id: 'vefat', label: '🪦 Vefat Edenler', count: deadCows.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setSection(tab.id);
                  setSearch('');
                  setFilter('Tümü');
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-2 transform active:scale-98 ${
                  section === tab.id
                    ? 'bg-white/20 text-white border-white shadow-sm'
                    : 'bg-transparent text-white/70 border-white/25 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className="bg-white/20 text-white text-[10px] py-0.5 px-2 rounded-full font-bold">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN SEARCH, FILTERS & GRID ── */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mt-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6 select-none items-center justify-between">
          {/* Search Input bar */}
          <div className="w-full md:flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-stone-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="İsim veya küpe no ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-stone-250 dark:border-zinc-800/80 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#b8924a] dark:focus:ring-[#7c5c2e] shadow-sm transition-shadow duration-200"
            />
          </div>

          {/* Status Filter Pill Buttons (Only active for active cows) */}
          {section === 'suru' && (
            <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none select-none justify-start md:justify-end">
              {['Tümü', ...Object.keys(STATUS_STYLES).filter(k => k !== 'Öldü')].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`py-2 px-3.5 rounded-xl border font-bold text-xs transition-all duration-150 cursor-pointer shadow-sm ${
                    filter === f
                      ? 'bg-gradient-to-r from-[#7c5c2e] to-[#b8924a] text-white border-[#7c5c2e] dark:border-[#b8924a]'
                      : 'bg-white dark:bg-zinc-900 text-[#7c5c2e] dark:text-zinc-350 border-stone-250 dark:border-zinc-800/80 hover:bg-stone-50 dark:hover:bg-zinc-850'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── CARD GRID OR LIST ── */}
        {section === 'vefat' ? (
          /* Deceased row list */
          filteredCows.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800 rounded-3xl p-8 select-none">
              <span className="text-6xl filter drop-shadow-md select-none">🪦</span>
              <h3 className="font-serif-playfair text-lg font-bold text-stone-800 dark:text-zinc-200 mt-4">
                Kayıt bulunamadı
              </h3>
              <p className="text-xs text-stone-450 dark:text-zinc-500 mt-1">
                Arama kriterlerinizi kontrol edin veya vefat kaydı bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="bg-zinc-850 text-stone-400 dark:text-zinc-400 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 select-none border border-stone-200/50 dark:border-zinc-800">
                🪦 {filteredCows.length} inek vefat kaydında listelendi
              </div>
              {filteredCows.map(cow => (
                <DeadAnimalRow
                  key={cow.id}
                  cow={cow}
                  onClick={() => onSelectCow(cow.id)}
                />
              ))}
            </div>
          )
        ) : (
          /* Active cattle grid list */
          filteredCows.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800 rounded-3xl p-8 select-none">
              <span className="text-6xl filter drop-shadow-md select-none">🐄</span>
              <h3 className="font-serif-playfair text-lg font-bold text-stone-800 dark:text-zinc-200 mt-4">
                İnek bulunamadı
              </h3>
              <p className="text-xs text-stone-450 dark:text-zinc-500 mt-1">
                Arama veya durum filtrelerinizi değiştirmeyi deneyin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredCows.map(cow => (
                <AnimalCard
                  key={cow.id}
                  cow={cow}
                  onClick={() => onSelectCow(cow.id)}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
