const express = require('express');
const app = express();

app.use(express.json()); // Parses JSON bodies

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes); // Mounts the router at /api/users

module.exports = app;