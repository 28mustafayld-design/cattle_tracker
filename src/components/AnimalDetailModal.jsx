import React, { useState, useEffect, useRef } from 'react';
import { calcAge, cowIcon, STATUS_STYLES, BREEDS, NOTE_TYPES, NOTE_STYLES } from '../utils';
import CameraCaptureModal from './CameraCaptureModal';

export default function AnimalDetailModal({ cow, isOpen, onClose, onUpdate, onDelete }) {
  if (!isOpen || !cow) return null;

  const [activeTab, setActiveTab] = useState('bilgiler'); // 'bilgiler' or 'notlar'
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ ...cow });
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Aşı',
    text: ''
  });

  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);

  // Sync form state when cow changes
  useEffect(() => {
    setForm({ ...cow });
    setEditMode(false);
    setShowNoteForm(false);
  }, [cow]);

  const handleFieldChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleSaveEdit = () => {
    onUpdate({
      ...form,
      weight: form.weight ? Number(form.weight) : 0,
      height: form.height ? Number(form.height) : 0,
    });
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setForm({ ...cow });
    setEditMode(false);
  };

  const handleDeleteCow = () => {
    if (confirm('Bu ineği silmek istediğinize emin misiniz?')) {
      onDelete(cow.id);
      onClose();
    }
  };

  // Image Upload handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const updatedCow = { ...cow, photo: event.target.result };
      onUpdate(updatedCow);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (confirm('Fotoğrafı kaldırmak istediğinize emin misiniz?')) {
      onUpdate({ ...cow, photo: null });
    }
  };

  // Note addition handler
  const handleAddNote = (e) => {
    e.preventDefault();
    const text = noteForm.text.trim();
    if (!text) return;

    const newNote = {
      date: noteForm.date,
      type: noteForm.type,
      text
    };

    const updatedNotes = [newNote, ...(cow.notes || [])];
    const updatedCow = { ...cow, notes: updatedNotes };

    // Auto-update lastVaccine / lastBirth based on note type
    if (noteForm.type === 'Aşı') {
      updatedCow.lastVaccine = noteForm.date;
    } else if (noteForm.type === 'Doğum') {
      updatedCow.lastBirth = noteForm.date;
    }

    onUpdate(updatedCow);
    setShowNoteForm(false);
    setNoteForm({
      date: new Date().toISOString().split('T')[0],
      type: 'Aşı',
      text: ''
    });
  };

  // Note deletion handler
  const handleDeleteNote = (noteIndex) => {
    if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      const updatedNotes = cow.notes.filter((_, i) => i !== noteIndex);
      onUpdate({ ...cow, notes: updatedNotes });
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === 'modalOverlay') {
      onClose();
    }
  };

  const sc = STATUS_STYLES[cow.status] || STATUS_STYLES['Sağlıklı'];

  return (
    <div
      id="modalOverlay"
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-[#1e0e00]/55 dark:bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-[2px] overflow-y-auto animate-fade-in"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200/50 dark:border-zinc-800 animate-slide-up">
        {/* Banner with Cow summary */}
        <div className="bg-gradient-to-br from-[#7c5c2e] via-[#b8924a] to-[#e4c97e] dark:from-[#3a2c16] dark:to-[#7c5c2e] p-6 pt-8 rounded-t-3xl relative text-white select-none">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 transition-all rounded-full w-8 h-8 flex items-center justify-center text-lg leading-none"
          >
            ×
          </button>
          
          <div className="flex items-center gap-5">
            {/* Photo upload / avatar container */}
            <div className="relative w-20 h-20 flex-shrink-0 group">
              <div
                onClick={() => setShowPhotoOptions(true)}
                className="w-20 h-20 rounded-2xl bg-white/25 dark:bg-zinc-850/40 flex items-center justify-center border-2 border-white/50 dark:border-zinc-700/50 overflow-hidden shadow-inner cursor-pointer hover:brightness-105 transition-all"
              >
                {cow.photo ? (
                  <img src={cow.photo} alt={cow.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl select-none">{cowIcon(cow.gender)}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoOptions(true)}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-sm shadow-md border-2 border-[#e4c97e] dark:border-zinc-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                📷
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* General Info */}
            <div className="min-w-0">
              <h2 className="font-serif-playfair text-2xl font-bold truncate">
                {cow.name || cow.tagNo}
              </h2>
              <p className="text-white/80 text-xs mt-1">
                Küpe No: <b className="text-white font-semibold">{cow.tagNo}</b>
              </p>
              <span
                className={`inline-flex items-center gap-1 mt-2 text-[10px] font-bold py-0.5 px-3 rounded-full border shadow-sm select-none ${sc.bgClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dotClass}`}></span>
                {cow.status}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-250 dark:border-zinc-800 px-6 bg-stone-50 dark:bg-zinc-900/40">
          <button
            onClick={() => { setActiveTab('bilgiler'); setShowNoteForm(false); }}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'bilgiler'
                ? 'text-[#7c5c2e] dark:text-[#b8924a] border-[#b8924a]'
                : 'text-stone-500 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-300 border-transparent'
            }`}
          >
            📋 Bilgiler
          </button>
          <button
            onClick={() => { setActiveTab('notlar'); }}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'notlar'
                ? 'text-[#7c5c2e] dark:text-[#b8924a] border-[#b8924a]'
                : 'text-stone-500 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-300 border-transparent'
            }`}
          >
            📝 Kayıtlar ({cow.notes ? cow.notes.length : 0})
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-6">
          {/* TAB 1: BİLGİLER */}
          {activeTab === 'bilgiler' && (
            <div className="space-y-4">
              {/* Edit Mode Buttons */}
              <div className="flex justify-end gap-2 mb-2">
                {editMode ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="text-xs bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 px-3.5 py-1.5 rounded-lg font-bold"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="text-xs bg-gradient-to-r from-[#7c5c2e] to-[#b8924a] text-white px-3.5 py-1.5 rounded-lg font-bold shadow-sm"
                    >
                      💾 Kaydet
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-xs bg-gradient-to-r from-[#7c5c2e] to-[#b8924a] text-white px-4 py-1.5 rounded-lg font-bold shadow-sm hover:brightness-105 transition-all"
                  >
                    ✏️ Düzenle
                  </button>
                )}
              </div>

              {/* Data Field Inputs */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'İnek Adı', key: 'name', type: 'text', placeholder: 'Sarıkız (İsteğe bağlı)' },
                  { label: 'Küpe No', key: 'tagNo', type: 'text', placeholder: 'TR-0001' },
                  { label: 'Doğum Tarihi', key: 'birthDate', type: 'date', placeholder: '' },
                  { label: 'Kilo (kg)', key: 'weight', type: 'number', placeholder: '500' },
                  { label: 'Boy (cm)', key: 'height', type: 'number', placeholder: '140' },
                  { label: 'Renk', key: 'color', type: 'text', placeholder: 'Siyah-Beyaz' },
                  ...(cow.status === 'Öldü' || form.status === 'Öldü' ? [{ label: 'Vefat Tarihi', key: 'deathDate', type: 'date', placeholder: '' }] : [])
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] text-stone-400 dark:text-zinc-400 font-bold uppercase block mb-1">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      disabled={!editMode}
                      value={form[f.key] || ''}
                      onChange={e => handleFieldChange(f.key, e.target.value)}
                      className="w-full bg-stone-50 disabled:bg-stone-100 disabled:cursor-default dark:bg-zinc-800/60 dark:disabled:bg-zinc-800 text-stone-900 dark:text-zinc-100 disabled:text-stone-700 dark:disabled:text-zinc-200 disabled:opacity-100 border border-stone-200/80 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b8924a]"
                    />
                  </div>
                ))}

                {/* Irk (Dropdown) */}
                <div>
                  <label className="text-[10px] text-stone-400 dark:text-zinc-400 font-bold uppercase block mb-1">
                    Irk
                  </label>
                  <select
                    disabled={!editMode}
                    value={form.breed || 'Holstein'}
                    onChange={e => handleFieldChange('breed', e.target.value)}
                    className="w-full bg-stone-50 disabled:bg-stone-100 disabled:cursor-default dark:bg-zinc-800/60 dark:disabled:bg-zinc-800 text-stone-900 dark:text-zinc-100 disabled:text-stone-700 dark:disabled:text-zinc-200 disabled:opacity-100 border border-stone-200/80 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    {BREEDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Cinsiyet (Dropdown) */}
                <div>
                  <label className="text-[10px] text-stone-400 dark:text-zinc-400 font-bold uppercase block mb-1">
                    Cinsiyet
                  </label>
                  <select
                    disabled={!editMode}
                    value={form.gender || 'Dişi'}
                    onChange={e => handleFieldChange('gender', e.target.value)}
                    className="w-full bg-stone-50 disabled:bg-stone-100 disabled:cursor-default dark:bg-zinc-800/60 dark:disabled:bg-zinc-800 text-stone-900 dark:text-zinc-100 disabled:text-stone-700 dark:disabled:text-zinc-200 disabled:opacity-100 border border-stone-200/80 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="Dişi">Dişi</option>
                    <option value="Erkek">Erkek</option>
                  </select>
                </div>

                {/* Durum (Dropdown) - Full width in 2-col layout */}
                <div className="col-span-2">
                  <label className="text-[10px] text-stone-400 dark:text-zinc-400 font-bold uppercase block mb-1">
                    Durum
                  </label>
                  <select
                    disabled={!editMode}
                    value={form.status || 'Sağlıklı'}
                    onChange={e => handleFieldChange('status', e.target.value)}
                    className="w-full bg-stone-50 disabled:bg-stone-100 disabled:cursor-default dark:bg-zinc-800/60 dark:disabled:bg-zinc-800 text-stone-900 dark:text-zinc-100 disabled:text-stone-700 dark:disabled:text-zinc-200 disabled:opacity-100 border border-stone-200/80 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    {Object.keys(STATUS_STYLES).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic summary card row */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-stone-100 dark:border-zinc-800">
                <div className="bg-stone-50 dark:bg-zinc-850/40 border border-stone-100 dark:border-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-[9px] text-stone-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Yaş</div>
                  <div className="text-[13px] font-bold text-stone-850 dark:text-zinc-200 mt-1 truncate">
                    {calcAge(cow.birthDate)}
                  </div>
                </div>
                <div className="bg-stone-50 dark:bg-zinc-850/40 border border-stone-100 dark:border-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-[9px] text-stone-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Son Aşı</div>
                  <div className="text-[13px] font-bold text-stone-850 dark:text-zinc-200 mt-1 truncate">
                    {cow.lastVaccine || '—'}
                  </div>
                </div>
                <div className="bg-stone-50 dark:bg-zinc-850/40 border border-stone-100 dark:border-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-[9px] text-stone-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Son Doğum</div>
                  <div className="text-[13px] font-bold text-stone-850 dark:text-zinc-200 mt-1 truncate">
                    {cow.lastBirth || '—'}
                  </div>
                </div>
              </div>

              {/* Critical Deletion Actions */}
              <div className="space-y-2 pt-6">
                <button
                  type="button"
                  onClick={handleDeleteCow}
                  className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-650 dark:text-rose-450 hover:bg-rose-100 dark:hover:bg-rose-950/40 font-semibold text-xs transition-all duration-150"
                >
                  🗑️ İneği Sil
                </button>
                {cow.photo && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="w-full py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-850/50 text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-850 font-semibold text-xs transition-all duration-150"
                  >
                    🗑️ Fotoğrafı Kaldır
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: KAYITLAR / TIMELINE */}
          {activeTab === 'notlar' && (
            <div className="space-y-4">
              {/* Add Note Trigger Button */}
              {!showNoteForm && (
                <button
                  onClick={() => setShowNoteForm(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-[#7c5c2e] to-[#b8924a] text-white font-bold rounded-xl text-xs shadow-md transition-all hover:brightness-105 active:scale-99"
                >
                  + Yeni Kayıt Ekle
                </button>
              )}

              {/* Note Form Panel */}
              {showNoteForm && (
                <form
                  onSubmit={handleAddNote}
                  className="bg-stone-50 dark:bg-zinc-850 border border-stone-200 dark:border-zinc-750 p-4 rounded-2xl space-y-3 animate-fade-in"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-stone-550 dark:text-zinc-400 font-bold uppercase block mb-1">
                        Tarih
                      </label>
                      <input
                        type="date"
                        value={noteForm.date}
                        required
                        onChange={e => setNoteForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-850 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-550 dark:text-zinc-400 font-bold uppercase block mb-1">
                        Kayıt Türü
                      </label>
                      <select
                        value={noteForm.type}
                        onChange={e => setNoteForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-850 dark:text-zinc-100 focus:outline-none"
                      >
                        {NOTE_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-550 dark:text-zinc-400 font-bold uppercase block mb-1">
                      Kayıt Açıklaması
                    </label>
                    <textarea
                      placeholder="Aşı adı, miktar veya diğer açıklamaları yazın..."
                      rows="3"
                      value={noteForm.text}
                      required
                      onChange={e => setNoteForm(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-850 dark:text-zinc-100 focus:outline-none resize-none"
                    ></textarea>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowNoteForm(false)}
                      className="flex-1 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-350 border border-stone-200 dark:border-zinc-700 text-xs font-semibold py-1.5 rounded-lg transition-all"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] bg-gradient-to-r from-[#7c5c2e] to-[#b8924a] text-white text-xs font-bold py-1.5 rounded-lg transition-all hover:brightness-105"
                    >
                      Kaydet
                    </button>
                  </div>
                </form>
              )}

              {/* Notes Timeline List */}
              {(!cow.notes || cow.notes.length === 0) ? (
                <div className="text-center py-10 text-stone-400 dark:text-zinc-500 select-none">
                  <div className="text-5xl">📋</div>
                  <div className="mt-3 text-sm font-semibold">Henüz kayıt eklenmemiş</div>
                  <div className="text-xs text-stone-450 dark:text-zinc-550 mt-1">
                    Aşı, veteriner hekim ziyareti veya doğum bilgilerini buraya not alabilirsiniz.
                  </div>
                </div>
              ) : (
                /* Sleek Chronological Timeline */
                <div className="relative pl-4 border-l-2 border-stone-200 dark:border-zinc-800 space-y-5 py-2 select-none">
                  {cow.notes.map((note, idx) => {
                    const style = NOTE_STYLES[note.type] || NOTE_STYLES['Diğer'];
                    return (
                      <div key={idx} className="relative group/item">
                        {/* Timeline Pin/Dot */}
                        <div className="absolute -left-[25px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 bg-stone-400 dark:bg-zinc-700 flex items-center justify-center text-[8px] text-white font-bold group-hover/item:bg-[#b8924a] transition-all">
                          {idx + 1}
                        </div>

                        {/* Chronological Card */}
                        <div
                          className={`border rounded-2xl p-3.5 transition-all shadow-sm group-hover/item:shadow-md ${style.bgClass}`}
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-bold flex items-center gap-1.5 select-none">
                              <span className="text-sm select-none">{style.icon}</span>
                              {note.type}
                            </span>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] opacity-75 font-semibold">
                                {note.date}
                              </span>
                              <button
                                onClick={() => handleDeleteNote(idx)}
                                title="Kaydı sil"
                                className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 text-sm font-extrabold cursor-pointer leading-none p-0.5 opacity-40 hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          <p className="text-[12px] leading-relaxed break-words font-medium text-stone-850 dark:text-zinc-200/90">
                            {note.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Photo Options Select Modal */}
      {showPhotoOptions && (
        <div
          onClick={() => setShowPhotoOptions(false)}
          className="fixed inset-0 bg-black/60 z-55 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-xs p-5 shadow-2xl border border-stone-200/50 dark:border-zinc-800 animate-scale-up space-y-3"
          >
            <h4 className="text-center font-serif-playfair text-base font-bold text-stone-850 dark:text-zinc-150 border-b border-stone-100 dark:border-zinc-800/80 pb-2">
              Fotoğraf Seçenekleri
            </h4>
            <button
              type="button"
              onClick={() => {
                setShowPhotoOptions(false);
                setShowCamera(true);
              }}
              className="w-full bg-stone-50 dark:bg-zinc-800/80 hover:bg-stone-100 dark:hover:bg-zinc-700/80 text-stone-750 dark:text-zinc-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-stone-200 dark:border-zinc-700/50"
            >
              📷 Fotoğraf Çek
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPhotoOptions(false);
                fileInputRef.current.click();
              }}
              className="w-full bg-stone-50 dark:bg-zinc-800/80 hover:bg-stone-100 dark:hover:bg-zinc-700/80 text-stone-750 dark:text-zinc-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-stone-200 dark:border-zinc-700/50"
            >
              🖼️ Galeriden Seç
            </button>
            {cow.photo && (
              <button
                type="button"
                onClick={() => {
                  setShowPhotoOptions(false);
                  handleRemovePhoto();
                }}
                className="w-full bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 text-rose-650 dark:text-rose-455 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900/30"
              >
                🗑️ Fotoğrafı Kaldır
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowPhotoOptions(false)}
              className="w-full bg-stone-200 hover:bg-stone-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-750 dark:text-zinc-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-all text-center"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(imgData) => {
          onUpdate({ ...cow, photo: imgData });
        }}
      />
    </div>
  );
}
