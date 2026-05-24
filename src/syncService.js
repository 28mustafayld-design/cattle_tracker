import { db, getAllCowsWithDeleted } from './db';

// Retrieve sync settings from localStorage
export function getSyncSettings() {
  const syncUrl = localStorage.getItem('sync_url') || '';
  const farmCode = localStorage.getItem('farm_code') || '';
  const lastSyncedAt = localStorage.getItem('sync_last_time') 
    ? Number(localStorage.getItem('sync_last_time')) 
    : null;
  return { syncUrl, farmCode, lastSyncedAt };
}

// Save sync settings
export function saveSyncSettings({ syncUrl, farmCode }) {
  if (syncUrl) {
    let sanitizedUrl = syncUrl.trim().replace(/\/$/, '');
    if (!sanitizedUrl.startsWith('http://') && !sanitizedUrl.startsWith('https://')) {
      sanitizedUrl = 'https://' + sanitizedUrl;
    }
    localStorage.setItem('sync_url', sanitizedUrl);
  }
  if (farmCode) {
    localStorage.setItem('farm_code', farmCode.trim().toUpperCase());
  }
}

// Clear all sync settings
export function clearSyncSettings() {
  localStorage.removeItem('sync_url');
  localStorage.removeItem('farm_code');
  localStorage.removeItem('sync_last_time');
}

// Checks if sync is properly configured
export function isSyncActive() {
  const { syncUrl, farmCode } = getSyncSettings();
  return !!(syncUrl && farmCode);
}

// Run the bi-directional synchronization process
export async function syncData() {
  const { syncUrl, farmCode } = getSyncSettings();
  if (!syncUrl || !farmCode) {
    return { success: false, error: 'Bulut senkronizasyon ayarları yapılmamış!' };
  }

  try {
    // 1. Fetch remote cows from Firebase Realtime Database
    const remoteResponse = await fetch(`${syncUrl}/farms/${farmCode}/cows.json`);
    if (!remoteResponse.ok) {
      throw new Error(`Bulut sunucusuna erişilemedi: ${remoteResponse.statusText}`);
    }
    const remoteData = await remoteResponse.json();

    // Normalize remote cows data to flat array
    let remoteCows = [];
    if (remoteData) {
      if (Array.isArray(remoteData)) {
        remoteCows = remoteData.filter(Boolean);
      } else {
        remoteCows = Object.values(remoteData);
      }
    }

    // Ensure types on remote data
    remoteCows = remoteCows.map(cow => ({
      ...cow,
      updatedAt: cow.updatedAt ? Number(cow.updatedAt) : 0,
      deleted: !!cow.deleted
    }));

    // 2. Fetch all local cows (including soft-deleted ones)
    const localCows = await getAllCowsWithDeleted();

    const localMap = new Map(localCows.map(c => [c.id, c]));
    const remoteMap = new Map(remoteCows.map(c => [c.id, c]));

    const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);

    const localUpdates = [];
    const remoteUpdates = [];
    let pulledCount = 0;
    let pushedCount = 0;

    for (const id of allIds) {
      const localCow = localMap.get(id);
      const remoteCow = remoteMap.get(id);

      if (localCow && remoteCow) {
        // Both exist: check who has the latest update
        const localTime = localCow.updatedAt || 0;
        const remoteTime = remoteCow.updatedAt || 0;

        if (localTime > remoteTime) {
          remoteUpdates.push(localCow);
          pushedCount++;
        } else if (remoteTime > localTime) {
          localUpdates.push(remoteCow);
          pulledCount++;
        }
      } else if (localCow) {
        // Only local exists: push to remote
        remoteUpdates.push(localCow);
        pushedCount++;
      } else if (remoteCow) {
        // Only remote exists: pull to local
        localUpdates.push(remoteCow);
        pulledCount++;
      }
    }

    // 3. Save remote updates into local IndexedDB
    for (const cow of localUpdates) {
      await db.cows.put(cow);
    }

    // 4. Upload local updates to remote Firebase Realtime Database
    if (remoteUpdates.length > 0) {
      await Promise.all(
        remoteUpdates.map(async (cow) => {
          await fetch(`${syncUrl}/farms/${farmCode}/cows/${cow.id}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cow)
          });
        })
      );
    }

    // 5. Update last sync time
    const now = Date.now();
    localStorage.setItem('sync_last_time', now.toString());

    return {
      success: true,
      pulled: pulledCount,
      pushed: pushedCount,
      lastSyncedAt: now
    };
  } catch (error) {
    console.error('Senkronizasyon Hatası:', error);
    return { success: false, error: error.message };
  }
}

// Instantly push a single cow change to Firebase (used for instant real-time updates)
export async function pushLiveChange(cow) {
  if (!isSyncActive()) return;
  const { syncUrl, farmCode } = getSyncSettings();
  if (!syncUrl || !farmCode) return;

  try {
    const formattedCow = {
      ...cow,
      updatedAt: cow.updatedAt || Date.now(),
      deleted: !!cow.deleted
    };
    
    await fetch(`${syncUrl}/farms/${farmCode}/cows/${cow.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedCow)
    });
  } catch (e) {
    console.warn('Anlık eşitleme başarısız oldu (internet bağlantısı olmayabilir):', e);
  }
}
