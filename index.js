const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const User = require("./controller/user");
const db = require("./model/db");
const session = require("express-session");

const app = express();
const user = new User();

// Starts the development server
app.listen(8000, () => {
  console.log("Running on port 8000...");
});

//Setup the public static engine
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    secret: "project",
    resave: false,
    saveUninitialized: false
  })
);

app.get("/", (req, res, next) => {
  res.render("landing");
});
// app.get("/home", (req, res, next) => {
//   res.render("home");
// });

// app.get("/", (req, res, next) => {
//   let user = req.session.user;
//   if (user) {
//     res.redirect("/crud");
//     return;
//   } else {
//     res.render("/home");
//   }
// });
//Sets the Landing page
// app.get("/home", (req, res, next) => {
//   let user = req.session.user;

//   if (user) {
//     res.render("/home", { opp: req.session.opp, name: user.FirstName });
//     return;
//   } else {
//     res.redirect("/");
//   }
// });

//Sets the Landing page
app.get("/login", (req, res) => {
  res.render("login");
});

//Sets the Landing page
app.get("/register", (req, res) => {
  res.render("register");
});

//Sets the Login Page
app.post("/login", (req, res, next) => {
  user.login(req.body.username, req.body.password, function(result) {
    if (result) {
      req.session.user = result;
      req.session.opp = 1;

      res.redirect("/crud");
    } else {
      res.send("Username or Password are incorrect!");
    }
  });
});

//Sets the Register Page
app.post("/register", (req, res) => {
  let userInput = {
    username: req.body.username,
    password: req.body.password
  };

  user.create(userInput, function(lastId) {
    if (lastId) {
      user.find(lastId, function(result) {
        req.session.user = result;
        req.session.opp = 0;

        res.redirect("/crud");
      });
    } else {
      console.log("Err creating a user");
    }
  });
});

//Loggoug Session

app.get("/loggout", (req, res, next) => {
  if (req.session.user) {
    req.session.destroy(function() {
      res.redirect("/");
    });
  }
});

//Response from the server
app.get("/crud", (req, res) => {
  let sql = "SELECT * from crud ORDER BY id DESC";
  let query = db.query(sql, (err, row) => {
    if (err) console.log(err);

    res.render("index", {
      title: "Notification Center for Project B",
      user: row
    });
  });
});

app.get("/crud_unauthorized", (req, res) => {
  let sql = "SELECT * from crud ORDER BY id DESC";
  let query = db.query(sql, (err, row) => {
    if (err) console.log(err);

    res.render("home", {
      title: "Notification Center for Project B",
      user: row
    });
  });
});
app.get("/add", (req, res) => {
  res.render("add", {
    title: "Add Notification"
  });
});

app.post("/save", (req, res) => {
  let data = {
    Subject: req.body.Subject,
    Description: req.body.Description,
    Severity: req.body.Severity
  };
  let sql = "INSERT INTO crud SET ? ";
  let query = db.query(sql, data, (err, results) => {
    if (err) console.log(err);

    res.redirect("/crud");
  });
});

app.get("/edit/:userId", (req, res) => {
  const userId = req.params.userId;
  let sql = "Select * from crud where id = ?";
  let query = db.query(sql, userId, (err, result) => {
    if (err) console.log(err);

    res.render("edit", {
      title: "Edit User",
      user: result[0]
    });
  });
});

app.post("/update", (req, res) => {
  const userId = req.body.id;
  let sql =
    "update crud SET Subject ='" +
    req.body.Subject +
    "', Description ='" +
    req.body.Description +
    "', Severity ='" +
    req.body.Severity +
    "' where id =" +
    userId;
  let query = db.query(sql, (err, results) => {
    if (err) console.log(err);

    res.redirect("/crud");
  });
});

app.get("/delete/:userId", (req, res) => {
  const userId = req.params.userId;
  let sql = "Delete from crud where id = ?";
  let query = db.query(sql, userId, (err, result) => {
    if (err) console.log(err);

    res.redirect("/crud");
  });
});

//Returns 404 Page
app.use((req, res, next) => {
  let err = new Error("Page not found");
  err.status = 404;
  next(err);
});
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render("404");
});
