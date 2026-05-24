import React from 'react';
import { calcAge, cowIcon } from '../utils';

export default function DeadAnimalRow({ cow, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-zinc-900 border border-stone-200/60 dark:border-zinc-800 rounded-2xl p-4 md:p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:border-stone-300 dark:hover:border-zinc-700 transition-all duration-200 group select-none opacity-85 hover:opacity-100 filter grayscale-[0.25] hover:grayscale-0"
    >
      {/* Icon Area */}
      <div className="text-4xl md:text-5xl flex-shrink-0 select-none bg-stone-100 dark:bg-zinc-800 p-2.5 rounded-xl border border-stone-200/30 dark:border-zinc-700/50">
        {cowIcon(cow.gender)}
      </div>

      {/* Info Area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline flex-wrap gap-x-2">
          <h3 className="font-serif-playfair text-base md:text-lg font-bold text-stone-800 dark:text-zinc-200 group-hover:text-[#7c5c2e] dark:group-hover:text-[#b8924a] transition-colors truncate">
            {cow.name || cow.tagNo}
          </h3>
          {cow.name && (
            <span className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
              Küpe: {cow.tagNo}
            </span>
          )}
        </div>
        
        <div className="text-xs text-stone-500 dark:text-zinc-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <span>
            {cow.breed || '—'} · {cow.gender || '—'}
          </span>
          {cow.birthDate && (
            <span>📅 Doğum: {cow.birthDate}</span>
          )}
          {cow.deathDate && (
            <span className="text-stone-700 dark:text-zinc-300 font-semibold">
              🪦 Vefat: {cow.deathDate}
            </span>
          )}
        </div>
      </div>

      {/* Count & Age Area */}
      <div className="text-right text-xs text-stone-500 dark:text-zinc-400 font-semibold self-center flex-shrink-0">
        <div className="bg-stone-50 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-stone-100 dark:border-zinc-800/80">
          <div>{(cow.notes && cow.notes.length) || 0} kayıt</div>
          <div className="text-[10px] text-stone-400 dark:text-zinc-500 mt-0.5">
            {calcAge(cow.birthDate)}
          </div>
        </div>
      </div>
    </div>
  );
}
