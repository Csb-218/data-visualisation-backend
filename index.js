const express = require('express');
const { resolve } = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
let { open } = require('sqlite');

const app = express();
app.use(cors());
const port = 3010;

let db;

(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });

  app.get('/', async (req, res) => {
    try {
      const query = 'SELECT * FROM peoplestats';
      const resp = await db.all(query, []);
      res.status(200).json(resp);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error retrieving data', error: error.message });
    }
  });

  app.get('/features', async (req, res) => {
    try {
      const query = `SELECT 
      SUM(A) AS A,
      SUM(B) AS B,
      SUM(C) AS C, 
      SUM(D) AS D, 
      SUM(F) AS E,
      SUM(E) AS F
      FROM peoplestats`;
      const resp = await db.all(query, []);
      res.status(200).json(resp[0]);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error retrieving data', error: error.message });
    }
  });

  app.get('/time_spent/:feature', async (req, res) => {
    const { feature } = req.params;
    const { age, gender } = req.query;
    console.log(feature, age, gender);
    try {
      let query;
      let result;

      if (age && !gender) {
        const query = `SELECT ${feature} , day
        FROM peoplestats
        WHERE  age = ?`;

        result = await db.all(query, [age]);
        console.log(result.length);
      } else if (!age && gender) {
        const query = `SELECT ${feature} , day
        FROM peoplestats
        WHERE  gender = ?`;

        result = await db.all(query, [gender]);
        console.log(result.length);
      } else if (age && gender) {
        const query = `SELECT ${feature} , day
        FROM peoplestats
        WHERE  gender = ? AND age = ?`;

        result = await db.all(query, [gender, age]);
        console.log(result.length);
      } else {
        query = `SELECT ${feature} , day
        FROM peoplestats  `;

        result = await db.all(query, []);
        console.log(result.length);
      }

      const timespent_per_day = result?.map((item) => {
        const [feature, day] = Object.entries(item);

        return {
          date: day[1],
          events: feature[1],
        };
      });

      res.status(200).json(timespent_per_day);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error retrieving data', error: error.message });
    }
  });

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})();
