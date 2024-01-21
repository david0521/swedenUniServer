const express = require('express');
const mongoose = require("mongoose")
const cors = require("cors");
const UniversityController = require("./controllers/university-controller")
const app = express();
app.use(express.json());
app.use(cors());
const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Swediversity";
const port = 3000;


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

app.use("/api/universities", UniversityController)

app.listen(port, function (err) {
  if (err) throw err;
  console.log(`Backend: http://localhost:${port}/api`);
});