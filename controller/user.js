const db = require("../model/db");
const bcrypt = require("bcrypt");

function User() {}

User.prototype = {
  //Find the user
  find: function(user = null, callback) {
    if (user) {
      let field = Number.isInteger(user) ? "id" : "";
    }
    let sql = "SELECT * FROM login WHERE username = ?";
    db.query(sql, user, function(err, result) {
      if (result.length) callback(result[0]);
    });
  },
  create: function(body, callback) {
    let pwd = body.password;
    body.password = bcrypt.hashSync(pwd, 10);

    let bind = [];
    for (key in body) {
      bind.push(body[key]);
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
      console.log(user);
      callback(null);
    });
  }
};

module.exports = User;
