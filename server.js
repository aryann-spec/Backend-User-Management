require('dotenv').config(); 
const app = require('./app'); // Import the app you defined above
const connectDB = require('./config/db');

// Connect Database
connectDB();

const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});