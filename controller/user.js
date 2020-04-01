const db = require("../model/db");
const bcrypt = require("bcrypt");

function User() {}

User.prototype = {
  //Find the user
  find: function(username, callback) {
    if (!username) return;

    let sql = `SELECT * FROM login WHERE username = ?`;

    db.query(sql, username, function(err, result) {
      if (err) throw err;
      console.log(sql);

      if (result.length) {
        callback(result[0]);
      } else {
        callback(null);
      }
    });
  },
  create: function(body, callback) {
    let pwd = body.password;
    body.password = bcrypt.hashSync(pwd, 10);

    let bind = [];
    for (key in body) {
      bind.push(body[key]);
      console.log(bind);
    }

    let sql = "INSERT INTO login(username, password) VALUES (?, ?)";

    db.query(sql, bind, function(err, lastId) {
      if (err) throw err;
      callback(lastId);
    });
  },
  login: function(username, password, callback) {
    this.find(username, function(user) {
      if (user) {
        if (bcrypt.compareSync(password, user.password)) {
          callback(user);
          return;
        }
      }
      callback(null);
    });
  }
};

module.exports = User;
