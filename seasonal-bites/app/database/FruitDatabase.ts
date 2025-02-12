import * as SQLite from 'expo-sqlite';

// opens the database
const openDatabase = async () => {
  const db = await SQLite.openDatabaseAsync('produce.db');
  console.log('Database opened successfully');
  return db;
};

// creates table
const initializeDB = async () => {

  const db = await openDatabase();

    const createTable = async () => {
      const createTableQuery = `
      CREATE TABLE IF NOT EXISTS produce (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_produce TEXT UNIQUE,
        description TEXT,
        image_path TEXT
      );
    `;
    await db.execAsync(createTableQuery);
    console.log('Table created successfully');

    };

    await createTable();

    return db;
};

const dbPromise = initializeDB();

const getDatabase = async () => {
  return await dbPromise;
};

// runs produce insert
const insertProduce = async (name_produce: string, description: string, image_path: string) => {

  const db = await getDatabase();
  const insertQuery = 'INSERT INTO produce (name_produce, description, image_path) VALUES (?, ?, ?)';
  await db.runAsync(insertQuery, [name_produce, description, image_path]);
  console.log(`Produce Item ${name_produce} added successfully`);

};

// runs produce insert whil checking for dupes
const insertUniqueProduce = async (name_produce: string, description: string, image_path: string) => {

    const db = await getDatabase();
    const checkQuery = 'SELECT COUNT(*) AS count FROM produce WHERE name_produce = ?';
    const result = await db.getAllAsync(checkQuery, [name_produce]);

    if (result) {
        return false; // Item already exists, no insertion
      }

    // inserts if result not found
    const insertQuery = 'INSERT INTO produce (name_produce, description, image_path) VALUES (?, ?, ?)';
    await db.runAsync(insertQuery, [name_produce, description, image_path]);
    console.log(`Produce Item ${name_produce} added successfully`);
    return true;
  
  };

// retreives produce with promise to be fullfilled
const getProduce = async (): Promise<any[]> => {

  const db = await getDatabase();
  const selectQuery = 'SELECT * FROM produce';
  const result = await db.getAllAsync(selectQuery);
  return result;

};

const getProduceByName = async (name_produce: string): Promise<any | null> => {

      const db = await getDatabase();
  
      const selectQuery = 'SELECT * FROM produce WHERE name_produce = ? LIMIT 1';
      const result = await db.getAllAsync(selectQuery, [name_produce]);
  
      return result || null; // Return result if found, otherwise return null
    
  };
  

export { insertProduce, getProduce, insertUniqueProduce, getProduceByName };
