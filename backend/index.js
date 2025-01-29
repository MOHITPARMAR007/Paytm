require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./db');


// Middleware
app.use(express.json());
app.use(cors());

const mainRouter = require('./routes/Index');

const PORT = process.env.PORT || 3000;
connectDB();
 

app.use('/api/v1/', mainRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
})