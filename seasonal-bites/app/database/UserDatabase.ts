// UserDatabase.ts
import * as SQLite from 'expo-sqlite';

interface FullUser {
  id: number;
  name_user: string;
  base_id: string;
  favorites: string;
  last_login: Date;
  location: string;
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

// Creates the table only once with last_login as an INTEGER (Unix Timestamp)
const initializeDB = async () => {
  const db = await openDatabase();
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_user TEXT UNIQUE,
      base_id TEXT UNIQUE,
      favorites TEXT,
      last_login INTEGER,  -- Store as Unix Timestamp
      location TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_base_id ON users(base_id);
  `;
  await db.execAsync(createTableQuery);
  console.log('✅ Table created (or already exists)');
};

const getDatabase = async () => {
  await initializeDB(); // Ensures DB is initialized only once
  return dbInstance!;
};

// Inserts user with last_login as a timestamp
const insertUser = async (
  name_user: string,
  base_id: string,
  favorites: string,
  last_login: Date,
  location: string
): Promise<boolean> => {
  try {
    const db = await getDatabase();
    const insertQuery =
      'INSERT OR IGNORE INTO users (name_user, base_id, favorites, last_login, location) VALUES (?, ?, ?, ?, ?)';
    
    const result = await db.runAsync(insertQuery, [name_user, base_id, favorites, last_login.getTime(), location]);

    if (result.changes && result.changes > 0) {
      console.log(`✅ User ${name_user} added successfully.`);
      return true; // User was inserted successfully
    } else {
      console.log(`⚠️ User ${name_user} already exists, no new record inserted.`);
      return false; // User was ignored (already exists)
    }
  } catch (error) {
    console.error(`❌ Error inserting user ${name_user}:`, error);
    return false; // Return false in case of error
  }
};


// Retrieves all users with enhanced logging
const getUser = async (): Promise<FullUser[]> => {
  console.log("🔄 Fetching all users from database...");
  const db = await getDatabase();
  const selectQuery = 'SELECT * FROM users';
  const result = await db.getAllAsync(selectQuery) as FullUser[];
  result.forEach((item: FullUser) => {
    item.last_login = new Date(item.last_login); // Convert timestamp to Date
  });
  console.log(`📜 Retrieved ${result.length} user items.`);
  return result;
};

// Retrieves user by name
const getUserByName = async (name_user: string): Promise<FullUser | null> => {
  const db = await getDatabase();
  const selectQuery = 'SELECT * FROM users WHERE name_user = ? LIMIT 1';
  const result = await db.getFirstAsync(selectQuery, [name_user]) as FullUser | undefined;
  return result ? { ...result, last_login: new Date(result.last_login) } : null;
};

// Retrieves user by base_id
const getUserByBaseId = async (base_id: string): Promise<FullUser | null> => {
  const db = await getDatabase();
  const selectQuery = 'SELECT * FROM users WHERE base_id = ? LIMIT 1';
  const result = await db.getFirstAsync(selectQuery, [base_id]) as FullUser | undefined;
  return result ? { ...result, last_login: new Date(result.last_login) } : null;
};

// Updates the user's favorites
const updateUserFavorites = async (base_id: string, favorites: string) => {
  const db = await getDatabase();
  try {
    const updateQuery = "UPDATE users SET favorites = ? WHERE base_id = ?";
    await db.runAsync(updateQuery, [favorites, base_id]);
    console.log(`✅ Successfully updated favorites for base_id: ${base_id}`);
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
    return result?.favorites || null;
  } catch (error) {
    console.error(`❌ Error retrieving favorites for base_id: ${base_id}`, error);
    return null;
  }
};

// Retrieves the user's location
const getUserLocation = async (base_id: string): Promise<string | null> => {
  const db = await getDatabase();
  try {
    const selectQuery = "SELECT location FROM users WHERE base_id = ? LIMIT 1";
    const result = await db.getFirstAsync(selectQuery, [base_id]) as { location: string } | undefined;
    return result?.location || null;
  } catch (error) {
    console.error(`❌ Error retrieving location for base_id: ${base_id}`, error);
    return null;
  }
};

// Updates the user's location
const updateUserLocation = async (base_id: string, location: string) => {
  const db = await getDatabase();
  try {
    const updateQuery = "UPDATE users SET location = ? WHERE base_id = ?";
    await db.runAsync(updateQuery, [location, base_id]);
    console.log(`✅ Successfully updated location for base_id: ${base_id}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating location for base_id: ${base_id}`, error);
    return false;
  }
};

// Retrieves the user's last login as a Date object
const getUserLastLogin = async (base_id: string): Promise<Date | null> => {
  const db = await getDatabase();
  try {
    const selectQuery = "SELECT last_login FROM users WHERE base_id = ? LIMIT 1";
    const result = await db.getFirstAsync(selectQuery, [base_id]) as { last_login: number } | undefined;
    return result ? new Date(result.last_login) : null;
  } catch (error) {
    console.error(`❌ Error retrieving last login for base_id: ${base_id}`, error);
    return null;
  }
};

// Updates the user's last login, storing the date as a timestamp
const updateUserLastLogin = async (base_id: string, last_login: Date) => {
  const db = await getDatabase();
  try {
    const updateQuery = "UPDATE users SET last_login = ? WHERE base_id = ?";
    await db.runAsync(updateQuery, [last_login.getTime(), base_id]);
    console.log(`✅ Successfully updated last login for base_id: ${base_id}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating last login for base_id: ${base_id}`, error);
    return false;
  }
};

// Exports
export {
  insertUser,
  getUser,
  getUserByName,
  getUserByBaseId,
  updateUserFavorites,
  getUserFavorites,
  getUserLocation,
  updateUserLocation,
  getUserLastLogin,
  updateUserLastLogin
};
