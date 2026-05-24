import React, { useState } from 'react';
import { BREEDS, STATUS_STYLES, cowIcon } from '../utils';
import CameraCaptureModal from './CameraCaptureModal';

export default function AddAnimalModal({ isOpen, onClose, onAdd }) {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    name: '',
    tagNo: '',
    birthDate: '',
    weight: '',
    height: '',
    color: '',
    breed: 'Holstein',
    gender: 'Dişi',
    status: 'Sağlıklı',
    photo: null
  });

  const [showCamera, setShowCamera] = useState(false);

  const handleChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange('photo', event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagNoTrimmed = form.tagNo.trim();
    if (!tagNoTrimmed) {
      alert('Küpe numarası zorunludur!');
      return;
    }

    onAdd({
      name: form.name.trim(),
      tagNo: tagNoTrimmed,
      birthDate: form.birthDate,
      weight: form.weight ? Number(form.weight) : '',
      height: form.height ? Number(form.height) : '',
      color: form.color.trim(),
      breed: form.breed,
      gender: form.gender,
      status: form.status,
      lastVaccine: '',
      lastBirth: '',
      deathDate: form.status === 'Öldü' ? new Date().toISOString().split('T')[0] : '',
      photo: form.photo,
      notes: []
    });

    // Reset and close
    setForm({
      name: '',
      tagNo: '',
      birthDate: '',
      weight: '',
      height: '',
      color: '',
      breed: 'Holstein',
      gender: 'Dişi',
      status: 'Sağlıklı',
      photo: null
    });
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-[#1e0e00]/55 dark:bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-[2px] overflow-y-auto animate-fade-in"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200/50 dark:border-zinc-800 animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#3d2200] via-[#5c3d11] to-[#b8924a] dark:from-zinc-950 dark:to-zinc-850 p-6 flex justify-between items-center text-white select-none">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐄</span>
            <h2 className="font-serif-playfair text-xl font-bold">Yeni İnek Ekle</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 transition-all rounded-full w-8 h-8 flex items-center justify-center text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Fotoğraf Ekleme Alanı */}
          <div className="flex items-center gap-5 pb-4 border-b border-stone-100 dark:border-zinc-800">
            {/* Avatar Gösterimi */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-stone-50 dark:bg-zinc-800 flex items-center justify-center border-2 border-stone-200 dark:border-zinc-700/60 overflow-hidden shadow-inner">
                {form.photo ? (
                  <img src={form.photo} alt="Önizleme" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl select-none">{cowIcon(form.gender)}</span>
                )}
              </div>
            </div>

            {/* Yükleme Butonları */}
            <div className="flex-1 space-y-2">
              <span className="text-[10px] text-stone-550 dark:text-zinc-400 font-bold uppercase tracking-wider block">
                İnek Fotoğrafı
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700/60 text-stone-750 dark:text-zinc-300 font-bold py-1.5 px-3 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
                >
                  📷 Fotoğraf Çek
                </button>
                <label className="bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700/60 text-stone-750 dark:text-zinc-300 font-bold py-1.5 px-3 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer">
                  🖼️ Galeriden Seç
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {form.photo && (
                  <button
                    type="button"
                    onClick={() => handleChange('photo', null)}
                    className="bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-650 dark:text-rose-400 font-bold py-1.5 px-3 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    🗑️ Fotoğrafı Kaldır
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* İnek Adı */}
            <div>
              <label className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                İnek Adı
              </label>
              <input
                type="text"
                placeholder="Sarıkız (İsteğe bağlı)"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 border border-stone-200 dark:border-zinc-700/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b8924a] dark:focus:ring-[#7c5c2e]"
              />
            </div>

            {/* Küpe No */}
            <div>
              <label className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Küpe No <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="TR-0001"
                required
                value={form.tagNo}
                onChange={e => handleChange('tagNo', e.target.value)}
                className="w-full bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 border border-stone-200 dark:border-zinc-700/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b8924a] dark:focus:ring-[#7c5c2e]"
              />
            </div>

            {/* Doğum Tarihi */}
            <div>
              <label className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Doğum Tarihi
              </label>
              <input
                type="date"
                value={form.birthDate}
                onChange={e => handleChange('birthDate', e.target.value)}
                className="w-full bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 border border-stone-200 dark:border-zinc-700/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b8924a] dark:focus:ring-[#7c5c2e]"
              />
            </div>

            {/* Kilo */}
            <div>
              <label className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Kilo (kg)
              </label>
              <input
                type="number"
                placeholder="500"
                value={form.weight}
                onChange={e => handleChange('weight', e.target.value)}
                className="w-full bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 border border-stone-200 dark:border-zinc-700/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b8924a] dark:focus:ring-[#7c5c2e]"
              />
            </div>

            {/* Boy */}
            <div>
              <label className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Boy (cm)
              </label>
              <input
                type="number"
                placeholder="140"
                value={form.height}
                onChange={e => handleChange('height', e.target.value)}
                className="w-full bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 border border-stone-200 dark:border-zinc-700/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b8924a] dark:focus:ring-[#7c5c2e]"
              />
            </div>

            {/* Renk */}
            <div>
              <label className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Renk
              </label>
              <input
                type="text"
                placeholder="Siyah-Beyaz"
                value={form.color}
                onChange={e => handleChange('color', e.target.value)}
                className="w-full bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 border border-stone-200 dark:border-zinc-700/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b8924a] dark:focus:ring-[#7c5c2e]"
              />
            </div>

            {/* Irk */}
            <div>
              <label className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Irk
              </label>
              <select
                value={form.breed}
                onChange={e => handleChange('breed', e.target.value)}
                className="w-full bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 border border-stone-200 dark:border-zinc-700/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b8924a] dark:focus:ring-[#7c5c2e]"
              >
                {BREEDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Cinsiyet */}
            <div>
              <label className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Cinsiyet
              </label>
              <select
                value={form.gender}
                onChange={e => handleChange('gender', e.target.value)}
                className="w-full bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 border border-stone-200 dark:border-zinc-700/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b8924a] dark:focus:ring-[#7c5c2e]"
              >
                <option value="Dişi">Dişi</option>
                <option value="Erkek">Erkek</option>
              </select>
            </div>

            {/* Durum */}
            <div className="col-span-2">
              <label className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Durum
              </label>
              <select
                value={form.status}
                onChange={e => handleChange('status', e.target.value)}
                className="w-full bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 border border-stone-200 dark:border-zinc-700/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b8924a] dark:focus:ring-[#7c5c2e]"
              >
                {Object.keys(STATUS_STYLES).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-stone-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-750 text-stone-700 dark:text-zinc-300 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all hover:bg-stone-200 dark:hover:bg-zinc-700"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-[2] bg-gradient-to-r from-[#7c5c2e] to-[#b8924a] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all hover:brightness-105 shadow-md shadow-amber-900/10"
            >
              ✅ İnek Ekle
            </button>
          </div>
        </form>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(imgData) => handleChange('photo', imgData)}
      />
    </div>
  );
}
