# Node Authentication with JWT and Twilio
A Node.js-based authentication system utilizing JWT for secure session management and Twilio for user registration and login processes. The system verifies each user request using JWT tokens and uses MySQL for data storage.

## Table of Contents

* Features
* Technologies
* Installation
* Configuration
* Usage
* API Endpoints
* Contributing
* License

## Features

* User registration with email/phone verification via Twilio
* Secure login with JWT token generation
* JWT-based request verification for protected routes
* Password hashing for secure storage
* MySQL database for storing user data
* Environment variable configuration for sensitive data
* Error handling and input validation

## Technologies

* Node.js: Server-side JavaScript runtime
* Express.js: Web framework for API development
* MySQL: Relational database for user data storage
* mysql2: MySQL client for Node.js
* JWT: JSON Web Tokens for authentication
* Twilio: SMS/voice API for user verification
* Bcrypt: Password hashing library
* Dotenv: Environment variable management

## Installation

1. ### Clone the repository:
<pre>
git clone https://github.com/zenith-za/node-authentication.git
cd node-authentication
</pre>


2. ### Install dependencies:
<pre>
npm install
</pre>


3. ### Set up MySQL:

* Install MySQL locally or use a cloud service.
* Create a database named database_db (or update the name in db.js).
* Ensure MySQL is running on localhost (or update the host in db.js).


4. ### Set up Twilio:

* Create a Twilio account and obtain your Account SID, Auth Token, and a Twilio phone number.
* Add these credentials to the .env file.



## Configuration
Create a .env file in the root directory with the following variables:
<pre>
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=database_db
JWT_SECRET=your_jwt_secret_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
</pre>


* PORT: Port for the server.
* DB_HOST: MySQL host (default: localhost).
* DB_USER: MySQL username (default: root).
* DB_PASSWORD: MySQL password (default: password).
* DB_NAME: Database name (default: database_db).
* JWT_SECRET: Secret key for JWT signing (use a strong, unique string).
* TWILIO_ACCOUNT_SID: Twilio Account SID.
* TWILIO_AUTH_TOKEN: Twilio Auth Token.
* TWILIO_PHONE_NUMBER: Twilio phone number for sending verification messages.

## Usage

 1. ### Start the server:
<pre>
npm start
</pre>

The server will run on http://localhost:3000 (or the specified port).

2. ### Interact with the API:Use tools like Postman or curl to test the endpoints (see API Endpoints).


## API Endpoints



| Method | Endpoint | Description | Authentication |
|--------|----------|-------------| ---------------|
| POST | /api/auth/register | Register a user with Twilio verification | None |
| POST | /api/auth/login | Log in and receive a JWT | None |
| GET | /api/auth/protected | Access a protected resource | JWT Required |


### Example Requests

* ### Register:
<pre>
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","phone":"+1234567890","password":"securepassword"}'
</pre>

 Triggers a Twilio verification message to the provided phone number.

* ### Login:
<pre>
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","password":"securepassword"}'
</pre>


* ### Protected Route:
<pre>
curl -X GET http://localhost:3000/api/auth/protected \
-H "Authorization: Bearer <your_jwt_token>"
</pre>



## Contributing
Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch (git checkout -b feature/your-feature).
3. Commit your changes (git commit -m "Add your feature").
4. Push to the branch (git push origin feature/your-feature).
5. Open a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
