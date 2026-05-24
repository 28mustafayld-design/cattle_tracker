import React, { useState, useEffect } from 'react';
import { getSyncSettings, saveSyncSettings, clearSyncSettings, syncData, isSyncActive } from '../syncService';

export default function SyncModal({ isOpen, onClose, onSyncSuccess }) {
  if (!isOpen) return null;

  const [settings, setSettings] = useState({ syncUrl: '', farmCode: '' });
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'
  const [showGuide, setShowGuide] = useState(false);

  // Load settings on open
  useEffect(() => {
    if (isOpen) {
      const data = getSyncSettings();
      setSettings({
        syncUrl: data.syncUrl,
        farmCode: data.farmCode
      });
      setLastSyncedAt(data.lastSyncedAt);
      setIsActive(isSyncActive());
      setMessage({ text: '', type: '' });
    }
  }, [isOpen]);

  const handleGenerateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'CIFT-';
    for (let i = 0; i < 3; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    code += '-';
    for (let i = 0; i < 3; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setSettings(prev => ({ ...prev, farmCode: code }));
    setMessage({ text: 'Yeni Çiftlik Kodu oluşturuldu. Eşitlemek istediğiniz diğer telefona da bu kodu girin!', type: 'success' });
  };

  const handleSave = () => {
    if (!settings.syncUrl.trim()) {
      setMessage({ text: 'Lütfen geçerli bir Veritabanı URL adresi girin!', type: 'error' });
      return;
    }
    if (!settings.farmCode.trim()) {
      setMessage({ text: 'Lütfen bir Çiftlik Kodu girin veya otomatik oluşturun!', type: 'error' });
      return;
    }

    saveSyncSettings({
      syncUrl: settings.syncUrl,
      farmCode: settings.farmCode
    });

    setIsActive(true);
    setMessage({ text: 'Eşitleme ayarları kaydedildi! İlk veri eşitlemesini yapmak için aşağıdaki "Şimdi Eşitle" butonuna basın.', type: 'success' });
  };

  const handleDisconnect = () => {
    if (window.confirm('Bulut bağlantısını kesmek istediğinize emin misiniz? Yerel verileriniz silinmez ancak diğer telefonla eşitleme durdurulur.')) {
      clearSyncSettings();
      setSettings({ syncUrl: '', farmCode: '' });
      setLastSyncedAt(null);
      setIsActive(false);
      setMessage({ text: 'Bulut bağlantısı kesildi. Uygulama sadece bu cihazda çalışacak.', type: 'success' });
      if (onSyncSuccess) onSyncSuccess();
    }
  };

  const handleSyncNow = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    // Auto save if user typed but didn't click save
    saveSyncSettings({
      syncUrl: settings.syncUrl,
      farmCode: settings.farmCode
    });

    const result = await syncData();
    setLoading(false);

    if (result.success) {
      setLastSyncedAt(result.lastSyncedAt);
      setIsActive(true);
      setMessage({
        text: `Eşitleme Başarılı! 📥 Buluttan alınan: ${result.pulled} | 📤 Buluta gönderilen: ${result.pushed}`,
        type: 'success'
      });
      if (onSyncSuccess) onSyncSuccess();
    } else {
      setMessage({
        text: `Senkronizasyon Başarısız: ${result.error}. Lütfen internet bağlantınızı ve veritabanı URL adresinizi kontrol edin.`,
        type: 'error'
      });
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Hiç yapılmadı';
    const date = new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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
            <span className="text-2xl">☁️</span>
            <h2 className="font-serif-playfair text-xl font-bold">Bulut Senkronizasyonu</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 transition-all rounded-full w-8 h-8 flex items-center justify-center text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status Indicator */}
          <div className="bg-stone-50 dark:bg-zinc-850 rounded-2xl p-4 border border-stone-150 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">
                Bulut Eşitleme Durumu
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`}></span>
                <span className="text-sm font-bold text-stone-850 dark:text-zinc-200">
                  {isActive ? 'Aktif (Çevrimiçi Eşitleme)' : 'Pasif (Sadece Bu Telefonda)'}
                </span>
              </div>
            </div>
            {isActive && (
              <div className="text-right">
                <span className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">
                  Son Eşitleme
                </span>
                <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                  {formatTime(lastSyncedAt)}
                </span>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {message.text && (
            <div className={`p-4 rounded-xl text-xs font-bold border ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Settings inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Firebase Veritabanı URL adresi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="https://suru-takip-xxxxx.firebasedatabase.app"
                value={settings.syncUrl}
                onChange={e => setSettings(prev => ({ ...prev, syncUrl: e.target.value }))}
                className="w-full bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 border border-stone-200 dark:border-zinc-700/60 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#b8924a] dark:focus:ring-[#7c5c2e]"
              />
            </div>

            <div>
              <label className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                Çiftlik Kodu (Her iki telefona aynı kodu girin) <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="CIFT-XXX-XXX"
                  value={settings.farmCode}
                  onChange={e => setSettings(prev => ({ ...prev, farmCode: e.target.value }))}
                  className="flex-1 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 border border-stone-200 dark:border-zinc-700/60 rounded-xl px-3 py-2 text-sm font-bold tracking-widest text-center focus:outline-none focus:ring-1 focus:ring-[#b8924a] dark:focus:ring-[#7c5c2e]"
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="bg-stone-150 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-stone-700 dark:text-zinc-250 font-bold text-xs px-4 rounded-xl border border-stone-200 dark:border-zinc-700 transition-all"
                >
                  🎲 Kod Oluştur
                </button>
              </div>
            </div>
          </div>

          {/* Configuration Guide Accordion */}
          <div className="border border-stone-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-stone-50/50 dark:bg-zinc-900/30">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full p-4 flex justify-between items-center font-bold text-xs text-[#7c5c2e] dark:text-zinc-350 bg-stone-100/50 dark:bg-zinc-850/50 select-none hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all"
            >
              <span>🛠️ Kendi ücretsiz veritabanınızı 1 dakikada kurun! (Kılavuz)</span>
              <span>{showGuide ? '▲' : '▼'}</span>
            </button>
            
            {showGuide && (
              <div className="p-4 text-xs text-stone-600 dark:text-zinc-400 space-y-3.5 border-t border-stone-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 leading-relaxed">
                <p>Uygulamanın verileri diğer telefonla senkronize etmesi için kendinize ait tamamen ücretsiz özel bir Firebase veritabanı adresi oluşturabilirsiniz:</p>
                
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong className="text-stone-800 dark:text-zinc-350">Proje Oluşturun:</strong>{' '}
                    <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-amber-700 dark:text-amber-400 underline font-bold">console.firebase.google.com</a> adresine gidin. Google hesabınızla giriş yapıp <span className="font-bold">"Add Project"</span> (Proje Ekle) butonuna basın. İsmini "Suru Takip" koyup projeyi oluşturun.
                  </li>
                  <li>
                    <strong className="text-stone-800 dark:text-zinc-350">Veritabanı Açın:</strong>{' '}
                    Sol menüden <span className="font-bold">"Realtime Database"</span> seçeneğine tıklayın. <span className="font-bold">"Create Database"</span> butonuna basın ve sonraki adımları geçerek kurun.
                  </li>
                  <li>
                    <strong className="text-stone-800 dark:text-zinc-350">Erişim Kurallarını Açın:</strong>{' '}
                    Veritabanı sayfasının üstündeki <span className="font-bold">"Rules"</span> (Kurallar) sekmesine gelin. Buradaki `".read": false` ve `".write": false` değerlerini <span className="font-bold text-emerald-600">`true`</span> olarak değiştirin ve <span className="font-bold">"Publish"</span> (Yayınla) butonuna basın.
                  </li>
                  <li>
                    <strong className="text-stone-850 dark:text-zinc-350">Bağlantıyı Tamamlayın:</strong>{' '}
                    "Data" sekmesine geri dönün ve en üstteki <span className="font-bold">`https://...`</span> ile başlayan veritabanı adresinizi kopyalayıp yukarıdaki "Firebase Veritabanı URL" alanına yapıştırın. İki telefona da aynı adresi ve Çiftlik Kodunu girdiğinizde veriler anında eşitlenir!
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col gap-2 pt-4 border-t border-stone-150 dark:border-zinc-800">
            <div className="flex gap-3">
              {isActive && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-rose-650 dark:text-rose-450 border border-stone-200 dark:border-zinc-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
                >
                  📴 Bağlantıyı Kes
                </button>
              )}
              
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-750 dark:text-zinc-350 font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
              >
                💾 Ayarları Kaydet
              </button>
            </div>

            <button
              type="button"
              onClick={handleSyncNow}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-550 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md shadow-emerald-950/10 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Veriler Eşitleniyor...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Şimdi Eşitle & Buluta Bağlan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
