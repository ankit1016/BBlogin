const express = require("express");
// const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const path = require("path");
require("./db/conn");
const Register = require("./models/register");
const app = express();
const port = process.env.port || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//this is for static website simple html page define the index.html inside public and we are able to use that page
const static_path = path.join(__dirname, "../BBbackend/public/");
console.log(static_path);
app.use(express.static(static_path));


// creating 24 hours from milliseconds
const oneDay = 1000 * 5;

//session middleware
app.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}));

var session;
// cookie parser middleware
app.use(cookieParser());

app.set("view engine", "ejs");
//-----------------------------ROUTE----------------------------------------------------------
app.get("/", (req, res) => {
  res.render("index");
  //   res.send("hello from home page");
});



app.get('/index.html', function (req, res, next) {
  res.render("course", { profile: `${profile}` });;
});





//create a new user in our database

//------------------------------how to send the data to the backend--------------------------------------------
// const registerStudent = new Register({
//   studentName: "Rithik Prakash",
//   uid: "19bca1164",
//   semester: 6,
//   password: "12345",
// });
// registerStudent.save();

// app.post("/register", async (req, res) => {
//   try {
//     // to show the data
//     // console.log(res.body.name)
//     const registerStudent = new Register({
//       studentName: req.body.name,
//       uid: req.body.uid,
//       semester: req.body.semester,
//       password: req.body.password,
//     });
//     const registered = await registerStudent.save();
//     //add the file where you want to send user after registration
//     res.status(201).render("index");
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

//check the user login detail

var profile;

app.post("/login", async (req, res) => {
  try {
    console.log(req);
    const Id = req.body.uid;
    const password = req.body.password;
    const user = await Register.findOne({ uid: Id });

    console.log(user);
    if (user.uid === Id && user.password === password) {

      session = req.session;
      session.userid = req.body.uid;
      console.log(req.session)
      profile = user.studentName;
      res.render("course", { profile: `${profile}` });

    } else {
      res.send("invalid details");
    }
  } catch (error) {
    res.status(400).send("invalid details");
  }
});


app.get('/logout', function (req, res) {

  req.session.destroy();
  res.redirect('/');
  console.log(req.session);
});

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
