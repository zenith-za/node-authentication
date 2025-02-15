require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const router = express.Router();
const verifyToken = require('./middleware/verifyToken');


const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Import the database connection
const db = require('./db')

// Define a route to get data
app.get('/api/data', (req, res) => {
    db.query('SELECT * FROM database_db', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET_KEY; ;

// REGISTRATION
app.post('/register', (req, res) => {
  
    const { email, cellphone_number, dytabank_referral_id } = req.body;

    // Validate unique email
    db.query('SELECT email FROM users WHERE email = ?', [email], (error, results) => {
        if (error) return res.status(500).send(error);

        if (results.length > 0) {
            return res.status(400).send('Email already exists');
            
        }

         // Insert new user
         const sql = 'INSERT INTO users (email, user_role_id, cellphone_number) VALUES (?, ?, ?)';
         db.query(sql, [email, 1, cellphone_number], (error, results) => {
             if (error) return res.status(500).send(error);

             const userId = results.insertId;

             // Generate a JWT
            const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({token: token, message: 'Registration successful' });
         });



    
    });
});

// OTP VERIFICATION TWILIO
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Replace with your Twilio account SID
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Replace with your Twilio auth token
const client = twilio(accountSid, authToken);

let otpStorage = {}; // Simple storage for OTPs (consider using a database in production)

function generateOTP(length) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10); // Generates a random digit (0-9)
    }
    return otp;
}

// Login route (first step)
app.post('/login', async (req, res) => {
    const { cellphone_number } = req.body;

    if (!cellphone_number) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    const sql = 'SELECT * FROM users WHERE cellphone_number = ?';
    db.query(sql, [cellphone_number], async (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];

        // Create JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

        // Respond with the JWT token
        res.status(200).json({ message: 'Login successful', token });
    });
});


// Request OTP route
app.post('/request-otp', verifyToken, async (req, res) => {
    const otp = generateOTP(6);
    const userId = req.userId;

    // Get the user's cellphone number from the database
    const getUserSql = 'SELECT cellphone_number FROM users WHERE id = ?';
    db.query(getUserSql, [userId], (getUserError, getUserResults) => {
        if (getUserError) {
            return res.status(500).send(getUserError);
        }

        if (getUserResults.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const cellphone_number = getUserResults[0].cellphone_number;

        // Update the OTP in the database
        const updateOtpSql = 'UPDATE users SET otp = ? WHERE id = ?';
        db.query(updateOtpSql, [otp, userId], async (updateOtpError, updateOtpResults) => {
            if (updateOtpError) {
                return res.status(500).send(updateOtpError);
            }

            // Send OTP via Twilio
            try {
                await client.messages.create({
                    body: `Your OTP code is ${otp}`,
                    from: '+14062820342', // Replace with your Twilio phone number
                    to: cellphone_number
                });
                res.status(200).json({ message: 'OTP sent' });
            } catch (error) {
                console.error('Error sending OTP:', error);
                res.status(500).json({ message: 'Failed to send OTP' });
            }
        });
    });
});

// Verify OTP route
app.post('/verify-otp', verifyToken, async (req, res) => {
    const { otp } = req.body;

    if (!otp) {
        return res.status(400).json({ message: 'OTP is required' });
    }

    const sql = 'SELECT * FROM users WHERE id = ? AND otp = ?';
    db.query(sql, [req.userId, otp], (error, results) => {
        if (error) {
            return res.status(500).send(error);
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid OTP' });
        } else {
            const updateSql = 'UPDATE users SET otp = NULL WHERE id = ?';
            db.query(updateSql, [req.userId], (updateError) => {
                if (updateError) {
                    return res.status(500).send(updateError);
                }

                // Generate a new JWT token (if desired) or confirm the OTP success
                const newToken = jwt.sign({ userId: req.userId }, JWT_SECRET, { expiresIn: '1h' });
                res.status(200).json({ message: 'OTP successful', token: newToken });
            });
        }
    });
});

// Import the routes
const routes = require('./routes/routes');

// Use the routes
app.use('/api', routes);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
