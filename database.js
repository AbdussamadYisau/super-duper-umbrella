const sqlite3 = require('sqlite3').verbose();
const md5 = require("md5");

const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if(err) {
        console.error(err.message);
        throw err;
    } else {
        console.log("Connected to the SQLite database");
        db.run(`CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text,
            email text UNIQUE,
            password text,
            CONSTRAINT email_unique UNIQUE (email)
        )`, (err) => {
            if (err) {
                // Table already created
            }
        });
    }
});


module.exports = db;