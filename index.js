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
  console.log("Running on port 5000...");
});

//Setup the public static engine
app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
      res.send("Logged as :" + result.username);
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
      res.send("Welcome " + userInput.username);
    } else {
      console.log("Err creating a user");
    }
  });
});

//Response from the server
app.get("/crud", (req, res) => {
  let sql = "SELECT * from crud";
  let query = db.query(sql, (err, row) => {
    if (err) console.log(err);

    res.render("index", {
      title: "CRUD Project B",
      user: row
    });
  });
});

app.get("/add", (req, res) => {
  res.render("add", {
    title: "Add Product to the list"
  });
});

app.post("/save", (req, res) => {
  let data = {
    FirstName: req.body.FirstName,
    LastName: req.body.LastName,
    Email: req.body.Email
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
    "update crud SET FirstName ='" +
    req.body.FirstName +
    "', LastName ='" +
    req.body.LastName +
    "', Email ='" +
    req.body.Email +
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
  res.send(err.message);
});
