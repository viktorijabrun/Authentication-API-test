# User Authentication API

This is a Node.js application that provides user registration, login, and profile update functionalities using PostgreSQL as the database and JWT for authentication. The application allows users to register with their details, log in, and update their email and title.

## Features

- User registration with hashed password
- User login with JWT token generation
- User profile update (email and title)
- Timezone conversion for created and updated timestamps to Europe/Vilnius
- PostgreSQL for storing user data

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL database
- Postman for testing the endpoints.

## Installation

#### 1. Clone the repository

https://github.com/viktorijabrun/Authentication-API-test.git

#### 2. Install dependencies

`npm install`

#### 3. Start the server

`npm run dev`

## How to Use the Postman Collection

#### 1. Import the Collection:

- Open Postman.
- Go to File > Import.
- Import the collection JSON file provided in this repository.

#### 2. Run the Tests:

- Choose the desired test cases (e.g., Registration, Login, Profile Update).
- Execute them in the Postman runner to validate the functionality of your API.
- The collection contains pre-request scripts that dynamically generate unique user details (email, surname, title, and password).

#### 3. Check the Results:

- Ensure the response status codes and data formats are correct.
- The tests also validate that the email format is correct, and the timestamps (created_at, updated_at) are in the proper format.

### Example Tests Included

- Register User: Tests successful registration and various failure cases (e.g., missing email).
- Login User: Verifies that the user can log in with valid credentials and checks for error messages with invalid credentials.
- Update User: Includes tests for updating the user's email and title after login, with different success and failure scenarios (e.g., missing token, invalid user).
