const express = require('express');
const aiRoutes = require('./routes/aiRoutes'); // Import your AI routes

const app = express();
app.use(express.json());

// Register the routes
app.use('/ai', aiRoutes); // '/ai' is the base path for AI-related routes

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
