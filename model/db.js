const mysql = require("mysql");
const until = require("util");

const db = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "inf440"
});

db.getConnection((err, connection) => {
  if (err) throw err;

  if (connection) {
    console.log("Connected to database ...");
    connection.release();
    return;
  }
});

db.query = until.promisify(db.query);

module.exports = db;
