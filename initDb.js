const sqlite3 = require('sqlite3').verbose();

const csv = require('csv-parser');

const fs = require('fs');

function convertDateFormat(dateString) {
  // Split the input string by '/'
  const [day, month, year] = dateString?.split('/');

  // Return the rearranged date string in 'yyyy-mm-dd' format
  return `${year}-${month}-${day}`;
}
const results = [];

fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (data) => {
    let sqlDate = convertDateFormat(data?.Day);
    console.log(sqlDate);
    data.Day = sqlDate;
    data.A = parseInt(data.A);
    data.B = parseInt(data.B);
    data.C = parseInt(data.C);
    data.D = parseInt(data.D);
    data.E = parseInt(data.E);
    data.F = parseInt(data.F);

    results.push(data);
  })
  .on('end', () => {
    console.log('pushed data into database');
  });

// Connect to SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS peoplestats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day DATE,
    age VARCHAR,
    gender TEXT,
    A INTEGER ,
    B INTEGER ,
    C INTEGER ,
    D INTEGER ,
    E INTEGER ,
    F INTEGER 
    )`,
    (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('peoplestats table created or already exists.');
      }
    }
  );

  const stmt = db.prepare(
    'INSERT INTO peoplestats (day, age, gender, A, B, C, D ,E, F) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (data) => {
      let sqlDate = convertDateFormat(data?.Day);

      stmt.run(
        sqlDate,
        data.Age.toString(),
        data.Gender,
        data.A,
        data.B,
        data.C,
        data.D,
        data.E,
        data.F
      );
    })
    .on('end', () => {
      console.log('pushed data into database');
      stmt.finalize();
      // Close the database connection
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed.');
        }
      });
    });

  console.log('Inserted 105 peopleStats into the database.');
});
