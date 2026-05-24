import Dexie from 'dexie';

export const db = new Dexie('SuruTakipDB');

db.version(1).stores({
  cows: '++id, tagNo, status, breed, gender'
});

// Helper functions for easy DB manipulation
export async function getAllCows() {
  return await db.cows.toArray();
}

export async function getCow(id) {
  return await db.cows.get(id);
}

export async function addCow(cow) {
  // Ensure numeric fields are properly typed
  const formattedCow = {
    ...cow,
    weight: cow.weight ? Number(cow.weight) : 0,
    height: cow.height ? Number(cow.height) : 0,
    notes: cow.notes || [],
    photo: cow.photo || null,
    lastVaccine: cow.lastVaccine || '',
    lastBirth: cow.lastBirth || '',
    deathDate: cow.deathDate || ''
  };
  return await db.cows.add(formattedCow);
}

export async function updateCow(cow) {
  const formattedCow = {
    ...cow,
    weight: cow.weight ? Number(cow.weight) : 0,
    height: cow.height ? Number(cow.height) : 0,
  };
  return await db.cows.put(formattedCow);
}

export async function deleteCow(id) {
  return await db.cows.delete(id);
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
      // If cow has an ID, we can put it. Otherwise, add.
      await db.cows.put(cow);
    }
    return true;
  } catch (error) {
    throw new Error('Veri içe aktarılamadı: ' + error.message);
  }
}
