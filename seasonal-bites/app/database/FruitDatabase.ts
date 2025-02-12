import * as SQLite from 'expo-sqlite';

interface ProduceItem {
  id: number;
  name_produce: string;
  description: string;
  imageurl: string;
}


// Global variable to store the database instance
let dbInstance: SQLite.SQLiteDatabase | null = null;

// Opens the database **only once**
const openDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('produce.db');
    console.log('✅ Database opened successfully');
  }
  return dbInstance;
};

// Creates the table only once
const initializeDB = async () => {
  const db = await openDatabase();

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS produce (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_produce TEXT UNIQUE,
      description TEXT,
      imageurl TEXT
    );
  `;

  await db.execAsync(createTableQuery);
  console.log('✅ Table created (or already exists)');
};

const getDatabase = async () => {
  await initializeDB();  // Ensures DB is initialized only once
  return dbInstance!;
};

// Inserts produce **without checking for duplicates**
const insertProduce = async (name_produce: string, description: string, imageurl: string) => {
  const db = await getDatabase();
  const insertQuery = 'INSERT INTO produce (name_produce, description, imageurl) VALUES (?, ?, ?)';
  await db.runAsync(insertQuery, [name_produce, description, imageurl]);
  console.log(`✅ Produce Item ${name_produce} added successfully`);
};

// Inserts produce **only if it doesn't exist**
const insertUniqueProduce = async (name_produce: string, description: string, imageurl: string) => {
  const db = await getDatabase();
  
  try {
    console.log(`🔍 Checking if '${name_produce}' already exists in database...`);

    const checkQuery = "SELECT COUNT(*) AS count FROM produce WHERE name_produce = ?";
    const result = await db.getFirstAsync(checkQuery, [name_produce]) as { count: number } | undefined;

    console.log(`📊 Found count for '${name_produce}':`, result?.count ?? "Unknown");

    if (result && result.count > 0) {
      console.log(`⚠️ Skipped '${name_produce}', already exists.`);
      return false; // Prevent duplicate insert
    }

    // If not found, insert into database
    const insertQuery = "INSERT INTO produce (name_produce, description, imageurl) VALUES (?, ?, ?)";
    await db.runAsync(insertQuery, [name_produce, description, imageurl]);

    console.log(`✅ Successfully inserted: '${name_produce}' into database.`);
    return true;

  } catch (error) {
    console.error(`❌ Error inserting '${name_produce}':`, error);
  }
};


// Retrieves produce with enhanced logging
const getProduce = async (): Promise<ProduceItem[]> => {
  console.log("🔄 Fetching produce from database...");
  const db = await getDatabase();
  const selectQuery = 'SELECT * FROM produce';
  
  const result = await db.getAllAsync(selectQuery) as ProduceItem[];  // Explicitly cast result
  
  console.log(`📜 Retrieved ${result.length} produce items.`);
  result.forEach((item: ProduceItem, index: number) => {  // Explicitly define type for 'item'
    console.log(`${index + 1}. ${item.name_produce} - ${item.description} - ${item.imageurl}`);
  });

  return result;
};


// Retrieves produce by name
const getProduceByName = async (name_produce: string): Promise<ProduceItem | null> => {
  const db = await getDatabase();
  const selectQuery = 'SELECT * FROM produce WHERE name_produce = ? LIMIT 1';
  
  const result = await db.getFirstAsync(selectQuery, [name_produce]) as ProduceItem | undefined;

  return result || null;  // Return null if no result is found
};

// Exports
export { insertProduce, getProduce, insertUniqueProduce, getProduceByName };
