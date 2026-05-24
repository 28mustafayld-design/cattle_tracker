export function calcAge(birthDateString) {
  if (!birthDateString) return '—';
  const b = new Date(birthDateString);
  const n = new Date();
  if (isNaN(b.getTime())) return '—';
  
  const m = (n.getFullYear() - b.getFullYear()) * 12 + (n.getMonth() - b.getMonth());
  if (m < 1) return '1 aydan küçük';
  if (m < 12) return m + ' ay';
  const y = Math.floor(m / 12);
  const mo = m % 12;
  return mo > 0 ? `${y} yaş ${mo} ay` : `${y} yaş`;
}

export function cowIcon(gender) {
  return gender === 'Erkek' ? '🐂' : '🐄';
}

export const BREEDS = ['Holstein', 'Simental', 'Angus', 'Jersey', 'Montofon', 'Limuzin', 'Diğer'];
export const NOTE_TYPES = ['Aşı', 'Doğum', 'Veteriner', 'Hastalık', 'Diğer'];

export const STATUS_STYLES = {
  'Sağlıklı': {
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30',
    dotClass: 'bg-emerald-500',
    dotStyle: '#10b981',
    text: 'Sağlıklı'
  },
  'Gebe': {
    bgClass: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30',
    dotClass: 'bg-amber-500',
    dotStyle: '#f59e0b',
    text: 'Gebe'
  },
  'Hasta': {
    bgClass: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30',
    dotClass: 'bg-rose-500',
    dotStyle: '#ef4444',
    text: 'Hasta'
  },
  'Satıldı': {
    bgClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700/30',
    dotClass: 'bg-slate-400',
    dotStyle: '#9ca3af',
    text: 'Satıldı'
  },
  'Öldü': {
    bgClass: 'bg-zinc-950 text-zinc-300 border-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800',
    dotClass: 'bg-zinc-500',
    dotStyle: '#6b7280',
    text: 'Öldü'
  }
};

export const NOTE_STYLES = {
  'Aşı': {
    bgClass: 'bg-blue-50/70 border-blue-100 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400',
    icon: '💉'
  },
  'Doğum': {
    bgClass: 'bg-purple-50/70 border-purple-100 text-purple-800 dark:bg-purple-950/20 dark:border-purple-900/30 dark:text-purple-400',
    icon: '🍼'
  },
  'Veteriner': {
    bgClass: 'bg-emerald-50/70 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400',
    icon: '🩺'
  },
  'Hastalık': {
    bgClass: 'bg-rose-50/70 border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400',
    icon: '🤒'
  },
  'Diğer': {
    bgClass: 'bg-zinc-50/80 border-zinc-200 text-zinc-700 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-300',
    icon: '📌'
  }
};
