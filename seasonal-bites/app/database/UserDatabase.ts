// UserDatabase.ts
import * as SQLite from 'expo-sqlite';

interface FullUser {
  id: number;
  name_user: string;
  base_id: string;
  favorites: string;
}

// Global variable to store the database instance
let dbInstance: SQLite.SQLiteDatabase | null = null;

// Opens the database **only once**
const openDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('user.db');
    console.log('✅ Database opened successfully');
  }
  return dbInstance;
};

// Creates the table only once
const initializeDB = async () => {
  const db = await openDatabase();
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_user TEXT UNIQUE,
      base_id TEXT,
      favorites TEXT
    );
  `;
  await db.execAsync(createTableQuery);
  console.log('✅ Table created (or already exists)');
};

const getDatabase = async () => {
  await initializeDB(); // Ensures DB is initialized only once
  return dbInstance!;
};

// Inserts user **without checking for duplicates**
// Using INSERT OR IGNORE so duplicates don’t cause errors.
const insertUser = async (name_user: string, base_id: string, favorites: string) => {
  const db = await getDatabase();
  const insertQuery = 'INSERT OR IGNORE INTO users (name_user, base_id, favorites) VALUES (?, ?, ?)';
  await db.runAsync(insertQuery, [name_user, base_id, favorites]);
  console.log(`✅ User ${name_user} added successfully (or already exists)`);
};

// Inserts user **only if it doesn't exist**
const insertUniqueUser = async (name_user: string, base_id: string, favorites: string) => {
  const db = await getDatabase();
  try {
    console.log(`🔍 Checking if '${name_user}' already exists in database...`);
    const checkQuery = "SELECT COUNT(*) AS count FROM users WHERE name_user = ?";
    const result = await db.getFirstAsync(checkQuery, [name_user]) as { count: number } | undefined;
    console.log(`📊 Found count for '${name_user}':`, result?.count ?? "Unknown");
    if (result && result.count > 0) {
      console.log(`⚠️ Skipped '${name_user}', already exists.`);
      return false; // Prevent duplicate insert
    }
    const insertQuery = "INSERT INTO users (name_user, base_id, favorites) VALUES (?, ?, ?)";
    await db.runAsync(insertQuery, [name_user, base_id, favorites]);
    console.log(`✅ Successfully inserted: '${name_user}' into database.`);
    return true;
  } catch (error) {
    console.error(`❌ Error inserting '${name_user}':`, error);
  }
};

// Retrieves all users with enhanced logging
const getUser = async (): Promise<FullUser[]> => {
  console.log("🔄 Fetching all users from database...");
  const db = await getDatabase();
  const selectQuery = 'SELECT * FROM users';
  const result = await db.getAllAsync(selectQuery) as FullUser[];
  console.log(`📜 Retrieved ${result.length} user items:`);
  result.forEach((item: FullUser, index: number) => {
    console.log(`${index + 1}. id: ${item.id}, name: ${item.name_user}, base_id: ${item.base_id}, favorites: ${item.favorites}`);
  });
  return result;
};

// Retrieves user by name
const getUserByName = async (name_user: string): Promise<FullUser | null> => {
  const db = await getDatabase();
  const selectQuery = 'SELECT * FROM users WHERE name_user = ? LIMIT 1';
  const result = await db.getFirstAsync(selectQuery, [name_user]) as FullUser | undefined;
  return result || null;
};

// Retrieves user by base_id
const getUserByBaseId = async (base_id: string): Promise<FullUser | null> => {
  const db = await getDatabase();
  const selectQuery = 'SELECT * FROM users WHERE base_id = ? LIMIT 1';
  const result = await db.getFirstAsync(selectQuery, [base_id]) as FullUser | undefined;
  return result || null;
};

// Updates the user's favorites
const updateUserFavorites = async (base_id: string, favorites: string) => {
  const db = await getDatabase();
  try {
    const updateQuery = "UPDATE users SET favorites = ? WHERE base_id = ?";
    await db.runAsync(updateQuery, [favorites, base_id]);
    console.log(`✅ Successfully updated favorites for user with base_id: ${base_id}`);
    // Optionally, print the updated row:
    const updatedUser = await getUserByBaseId(base_id);
    console.log("📝 Updated user row:", updatedUser);
    return true;
  } catch (error) {
    console.error(`❌ Error updating favorites for base_id: ${base_id}`, error);
    return false;
  }
};

// Retrieves the user's favorites
const getUserFavorites = async (base_id: string): Promise<string | null> => {
  const db = await getDatabase();
  try {
    const selectQuery = "SELECT favorites FROM users WHERE base_id = ? LIMIT 1";
    const result = await db.getFirstAsync(selectQuery, [base_id]) as { favorites: string } | undefined;
    if (result && result.favorites !== null) {
      console.log(`✅ Successfully retrieved favorites for base_id: ${base_id} -> "${result.favorites}"`);
      return result.favorites;
    } else {
      console.log(`⚠️ No favorites found for base_id: ${base_id}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error retrieving favorites for base_id: ${base_id}`, error);
    return null;
  }
};

// Exports
export {
  insertUser,
  getUser,
  insertUniqueUser,
  getUserByName,
  getUserByBaseId,
  updateUserFavorites,
  getUserFavorites,
};
