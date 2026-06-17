const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // Math signs the user ID with our secret key to make a secure token
    // It will stay valid for 30 days
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = generateToken;