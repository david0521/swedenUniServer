const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require("mongoose")
const cors = require("cors");
const UniversityController = require("./controllers/university-controller");
const ProgramController = require("./controllers/programs-controller");
const UserController = require("./controllers/user-controller");
const ConsentController = require("./controllers/consentForm-controller");
const AuthController = require("./controllers/auth-controller");
const RecordController = require("./controllers/record-controller")

const app = express();
require('dotenv').config()
app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
const port = 3000;

app.use(session({
  secret: jwtSecret,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());

// Connect to MongoDB
mongoose
    .connect(mongoURI)
    .then(function () {
        console.log(`Connected to MongoDB with URI: ${mongoURI}`);
    })
    .catch(function (err) {
        if (err) {
            console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
            console.error(err.stack);
            process.exit(1);
        }
        console.log(`Connected to MongoDB with URI: ${mongoURI}`);
    });

app.get('/api', (req, res) => {
  res.send('Swediversity API is running');
});

app.use("/api/universities", UniversityController);
app.use("/api/programs", ProgramController);
app.use("/api/users", UserController);
app.use("/api/consents", ConsentController);
app.use("/api/auth", AuthController);
app.use("/api/records", RecordController);

app.listen(port, function (err) {
  if (err) throw err;
  console.log(`Backend: http://localhost:${port}/api`);
});