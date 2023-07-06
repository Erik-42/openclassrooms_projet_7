const express = require('express');
const rateLimit = require('express-rate-limit')
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config()

const bookRoutes = require('./routes/bookRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

mongoose
    .connect(
        `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.HOST}/?retryWrites=true&w=majority`,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 1000, // Limit each IP to 1000 requests per `window` (here, per 1 hour)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.use(limiter)

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
