import * as SQLite from 'expo-sqlite';

interface ProduceItem {
  id: number;
  produce_doc: string;
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
  }
  return dbInstance;
};

// Creates the table only once
const initializeDB = async () => {
  const db = await openDatabase();

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS produce (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produce_doc TEXT UNIQUE,
      name_produce TEXT UNIQUE,
      description TEXT,
      imageurl TEXT
    );
  `;

  await db.execAsync(createTableQuery);
};

const getDatabase = async () => {
  await initializeDB();  // Ensures DB is initialized only once
  return dbInstance!;
};

// Inserts produce **without checking for duplicates**
const insertProduce = async (produce_doc: string, name_produce: string, description: string, imageurl: string) => {
  const db = await getDatabase();
  const insertQuery = 'INSERT INTO produce (produce_doc, name_produce, description, imageurl) VALUES (?, ?, ?, ?)';
  await db.runAsync(insertQuery, [produce_doc, name_produce, description, imageurl]);
};

// Inserts produce **only if it doesn't exist**
const insertUniqueProduce = async (produce_doc: string, name_produce: string, description: string, imageurl: string) => {
  const db = await getDatabase();
  
  try {

    const checkQuery = "SELECT COUNT(*) AS count FROM produce WHERE name_produce = ?";
    const result = await db.getFirstAsync(checkQuery, [name_produce]) as { count: number } | undefined;

    if (result && result.count > 0) {
      return false; // Prevent duplicate insert
    }

    // If not found, insert into database
    const insertQuery = "INSERT INTO produce (produce_doc, name_produce, description, imageurl) VALUES (?, ?, ?, ?)";
    await db.runAsync(insertQuery, [produce_doc, name_produce, description, imageurl]);

    return true;

  } catch (error) {
    console.error(`❌ Error inserting '${name_produce}':`, error);
  }
};


// Retrieves produce with enhanced logging
const getProduce = async (): Promise<ProduceItem[]> => {
  const db = await getDatabase();
  const selectQuery = 'SELECT * FROM produce';
  
  const result = await db.getAllAsync(selectQuery) as ProduceItem[];  // Explicitly cast result
  
  result.forEach((item: ProduceItem, index: number) => {  // Explicitly define type for 'item'
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

const getProduceByDoc = async (produce_doc: string): Promise<ProduceItem | null> => {
    const db = await getDatabase();
    const selectQuery = 'SELECT * FROM produce WHERE produce_doc = ? LIMIT 1';
    
    const result = await db.getFirstAsync(selectQuery, [produce_doc]) as ProduceItem | undefined;
  
    return result || null;  // Return null if no result is found
  };

// Exports

export { insertProduce, getProduce, insertUniqueProduce, getProduceByName, getProduceByDoc };
