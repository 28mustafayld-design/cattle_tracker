import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AddAnimalModal from './components/AddAnimalModal';
import AnimalDetailModal from './components/AnimalDetailModal';
import SyncModal from './components/SyncModal';
import { getAllCows, getCow, addCow, updateCow, deleteCow, importData, exportData } from './db';
import { isSyncActive, syncData, pushLiveChange } from './syncService';

export default function App() {
  const [cows, setCows] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tümü');
  const [section, setSection] = useState('suru'); // 'suru' or 'vefat'
  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [syncActive, setSyncActive] = useState(false);
  const [dark, setDark] = useState(false);

  // Initialize Theme, Sync Status, and Fetch Cows
  useEffect(() => {
    // 1. Theme Configuration
    const localTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = localTheme === 'dark' || (!localTheme && prefersDark);
    
    setDark(initialDark);
    if (initialDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Fetch Data from IndexedDB
    fetchCows();

    // 3. Initial Cloud Sync on Startup if active
    const active = isSyncActive();
    setSyncActive(active);
    if (active) {
      syncData().then(result => {
        if (result.success) {
          fetchCows(); // Refresh list with newly pulled cows
        }
      });
    }
  }, []);

  const fetchCows = async () => {
    try {
      const data = await getAllCows();
      // Sort cows: newest first (similar to prepending in state)
      // Since Dexie ++id generates ascending ids, we reverse them to match newest-first
      const sorted = [...data].reverse();
      setCows(sorted);
    } catch (error) {
      console.error('Veri çekilirken hata oluştu:', error);
    }
  };

  const handleToggleDark = () => {
    const nextDark = !dark;
    setDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Add Cow Action
  const handleAdd = async (newCow) => {
    try {
      const addedId = await addCow(newCow);
      await fetchCows();
      
      // Push live update to Firebase if online
      if (isSyncActive()) {
        const cowFromDb = await getCow(addedId);
        if (cowFromDb) {
          pushLiveChange(cowFromDb);
        }
      }
    } catch (error) {
      alert('İnek eklenirken hata oluştu: ' + error.message);
    }
  };

  // Update Cow Action
  const handleUpdate = async (updatedCow) => {
    try {
      await updateCow(updatedCow);
      await fetchCows();

      // Push live update to Firebase if online
      if (isSyncActive()) {
        const cowFromDb = await getCow(updatedCow.id);
        if (cowFromDb) {
          pushLiveChange(cowFromDb);
        }
      }
    } catch (error) {
      alert('Güncelleme sırasında hata oluştu: ' + error.message);
    }
  };

  // Delete Cow Action
  const handleDelete = async (id) => {
    try {
      await deleteCow(id);
      if (selectedId === id) {
        setSelectedId(null);
      }
      await fetchCows();

      // Push deletion state (soft delete) to Firebase if online
      if (isSyncActive()) {
        const cowFromDb = await getCow(id);
        if (cowFromDb) {
          pushLiveChange(cowFromDb);
        }
      }
    } catch (error) {
      alert('Silme işlemi sırasında hata oluştu: ' + error.message);
    }
  };

  // Backup: JSON Export
  const handleExport = async () => {
    try {
      const jsonString = await exportData();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suru_takip_yedek_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Yedek dışarı aktarılamadı: ' + error.message);
    }
  };

  // Backup: JSON Import
  const handleImport = async (jsonString) => {
    if (!confirm('Dikkat: Bu işlem mevcut tüm verileri temizleyecek ve yedekteki verileri yükleyecektir. Devam etmek istiyor musunuz?')) {
      return;
    }
    try {
      await importData(jsonString);
      await fetchCows();
      
      // If sync is active, upload imported data to cloud
      if (isSyncActive()) {
        syncData();
      }

      alert('Yedek başarıyla yüklendi!');
    } catch (error) {
      alert('Yedek yüklenirken hata oluştu: ' + error.message);
    }
  };

  const handleSyncSettingsChange = () => {
    setSyncActive(isSyncActive());
    fetchCows();
  };

  const selectedCow = cows.find(c => c.id === selectedId);

  return (
    <div className="min-h-screen text-slate-800 dark:text-zinc-100 bg-[#faf7f2] dark:bg-zinc-950 transition-colors duration-200">
      {/* Dashboard View */}
      <Dashboard
        cows={cows}
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        section={section}
        setSection={setSection}
        onSelectCow={setSelectedId}
        onOpenAdd={() => setShowAdd(true)}
        onImport={handleImport}
        onExport={handleExport}
        dark={dark}
        onToggleDark={handleToggleDark}
        isSyncActive={syncActive}
        onOpenSync={() => setShowSync(true)}
      />

      {/* Modals */}
      <AddAnimalModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={handleAdd}
      />

      <AnimalDetailModal
        cow={selectedCow}
        isOpen={!!selectedCow}
        onClose={() => setSelectedId(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      <SyncModal
        isOpen={showSync}
        onClose={() => setShowSync(false)}
        onSyncSuccess={handleSyncSettingsChange}
      />
    </div>
  );
}
