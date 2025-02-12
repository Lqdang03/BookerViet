const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json()); // Middleware để xử lý request body dạng JSON 

const { db } = require('./config/db');


// Basic route 
app.get('/', (req, res) => res.send('Hello World!'));


app.listen(process.env.PORT, 'localhost', async () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
    db.ConnectDB();
});