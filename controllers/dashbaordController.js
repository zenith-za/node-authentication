const db = require('../db'); // Import the database connection

// Function to get income information
const getUserInfo = (req, res) => {
    
    const sql = 'SELECT * FROM user WHERE user = ?';
    db.query(sql, [req.userId], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database error', error });
        }
        res.status(200).json(results);
    });
};

module.exports = {
    getUserInfo
};