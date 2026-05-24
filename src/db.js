import Dexie from 'dexie';

export const db = new Dexie('SuruTakipDB');

db.version(1).stores({
  cows: '++id, tagNo, status, breed, gender'
});

// Unique string ID generator to prevent collision across devices
export function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  const deviceSeed = Math.random().toString(36).substring(2, 5);
  return `cow_${timestamp}_${randomStr}_${deviceSeed}`;
}

// Helper functions for easy DB manipulation
// Returns only non-deleted cows
export async function getAllCows() {
  const data = await db.cows.toArray();
  return data.filter(c => !c.deleted);
}

// Returns all cows including deleted ones (used for syncing)
export async function getAllCowsWithDeleted() {
  return await db.cows.toArray();
}

export async function getCow(id) {
  return await db.cows.get(id);
}

export async function addCow(cow) {
  // Ensure numeric fields are properly typed
  const formattedCow = {
    ...cow,
    id: cow.id || generateUniqueId(), // Use custom unique ID if not provided
    weight: cow.weight ? Number(cow.weight) : 0,
    height: cow.height ? Number(cow.height) : 0,
    notes: cow.notes || [],
    photo: cow.photo || null,
    lastVaccine: cow.lastVaccine || '',
    lastBirth: cow.lastBirth || '',
    deathDate: cow.deathDate || '',
    updatedAt: Date.now(),
    deleted: false
  };
  return await db.cows.add(formattedCow);
}

export async function updateCow(cow) {
  const formattedCow = {
    ...cow,
    weight: cow.weight ? Number(cow.weight) : 0,
    height: cow.height ? Number(cow.height) : 0,
    updatedAt: Date.now() // Update timestamp on every modification
  };
  return await db.cows.put(formattedCow);
}

// Soft delete so the deletion can be synced to other devices
export async function deleteCow(id) {
  const cow = await db.cows.get(id);
  if (cow) {
    cow.deleted = true;
    cow.updatedAt = Date.now();
    return await db.cows.put(cow);
  }
}

// Export database as JSON string
export async function exportData() {
  const cows = await db.cows.toArray();
  return JSON.stringify(cows, null, 2);
}

// Import JSON data into database
export async function importData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      throw new Error('İçe aktarılan veri bir inek listesi (array) olmalıdır!');
    }

    // Basic structure verification
    for (const item of parsed) {
      if (!item.tagNo) {
        throw new Error('Her ineğin bir küpe numarası (tagNo) olması zorunludur!');
      }
    }

    // Clear current database and restore
    await db.cows.clear();
    
    // Add all cows. Ensure fields are preserved
    for (const cow of parsed) {
      const formatted = {
        ...cow,
        id: cow.id || generateUniqueId(),
        updatedAt: cow.updatedAt || Date.now(),
        deleted: cow.deleted !== undefined ? cow.deleted : false
      };
      await db.cows.put(formatted);
    }
    return true;
  } catch (error) {
    throw new Error('Veri içe aktarılamadı: ' + error.message);
  }
}

