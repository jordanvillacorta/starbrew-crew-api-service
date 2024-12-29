require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS - Add this before your routes
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],  // Add any other allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rest of your app configuration...
app.use(express.json());
app.use('/api', require('./routes/mapboxRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;