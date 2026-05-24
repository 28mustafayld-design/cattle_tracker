import React from 'react';
import { calcAge, cowIcon, STATUS_STYLES } from '../utils';

export default function AnimalCard({ cow, onClick }) {
  const sc = STATUS_STYLES[cow.status] || STATUS_STYLES['Sağlıklı'];

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-stone-200/60 dark:border-zinc-800"
    >
      {/* Card Header (Photo/Placeholder & Status Badge) */}
      <div className="h-[130px] bg-gradient-to-br from-[#7c5c2e] via-[#b8924a] to-[#e4c97e] dark:from-[#3a2c16] dark:to-[#7c5c2e] flex items-center justify-center relative select-none">
        {cow.photo ? (
          <img
            src={cow.photo}
            alt={cow.name || cow.tagNo}
            className="w-full h-full object-cover absolute inset-0"
            loading="lazy"
          />
        ) : (
          <span className="text-6xl filter drop-shadow-md select-none transform hover:scale-110 transition-transform duration-300">
            {cowIcon(cow.gender)}
          </span>
        )}
        
        {/* Absolute Status Badge */}
        <span
          className={`absolute top-3 right-3 text-[11px] font-bold py-1 px-3.5 rounded-full flex items-center gap-1.5 border backdrop-blur-[2px] shadow-sm select-none ${sc.bgClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dotClass}`}></span>
          {cow.status}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Name and Breed */}
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="font-serif-playfair text-lg font-bold text-stone-900 dark:text-zinc-100 truncate">
              {cow.name || cow.tagNo}
            </h3>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              Küpe: <b className="text-stone-700 dark:text-zinc-300 font-semibold">{cow.tagNo}</b>
            </p>
          </div>
          <span className="text-[11px] text-stone-600 dark:text-zinc-300 bg-stone-100 dark:bg-zinc-800 border border-stone-200/50 dark:border-zinc-700/50 rounded-lg px-2.5 py-1 font-bold whitespace-nowrap">
            {cow.breed || '—'}
          </span>
        </div>

        {/* Dynamic Metric Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-stone-50 dark:bg-zinc-800/40 rounded-xl p-2 text-center border border-stone-100 dark:border-zinc-800">
            <div className="text-[9px] text-stone-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Yaş</div>
            <div className="text-[12px] font-bold text-stone-800 dark:text-zinc-200 mt-0.5 truncate" title={calcAge(cow.birthDate)}>
              {calcAge(cow.birthDate)}
            </div>
          </div>
          <div className="bg-stone-50 dark:bg-zinc-800/40 rounded-xl p-2 text-center border border-stone-100 dark:border-zinc-800">
            <div className="text-[9px] text-stone-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Kilo</div>
            <div className="text-[12px] font-bold text-stone-800 dark:text-zinc-200 mt-0.5 truncate">
              {cow.weight ? `${cow.weight} kg` : '—'}
            </div>
          </div>
          <div className="bg-stone-50 dark:bg-zinc-800/40 rounded-xl p-2 text-center border border-stone-100 dark:border-zinc-800">
            <div className="text-[9px] text-stone-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Boy</div>
            <div className="text-[12px] font-bold text-stone-800 dark:text-zinc-200 mt-0.5 truncate">
              {cow.height ? `${cow.height} cm` : '—'}
            </div>
          </div>
        </div>

        {/* Record count footer if exists */}
        {cow.notes && cow.notes.length > 0 && (
          <div className="mt-3.5 pt-2.5 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <span>📋</span> {cow.notes.length} kayıt listelendi
            </span>
            {cow.lastVaccine && (
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                💉 Son Aşı: {cow.lastVaccine}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
