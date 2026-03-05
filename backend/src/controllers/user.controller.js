import { pool } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // 1. Grab user data to put in the Access Token payload
        const userResult = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        // 2. Generate Access Token (Short lived)
        const accessToken = jwt.sign(
            { _id: user.id, email: user.email, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        // 3. Generate Refresh Token (Long lived, only needs the ID)
        const refreshToken = jwt.sign(
            { _id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );

        // 4. Save the Refresh Token in the database
        await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, userId]);

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // 1. We now expect a password in the request body
    const { name, email, phone, role, password } = req.body;

    if (!name || !email || !phone || !password) {
        throw new ApiError(400, "Name, email, phone, and password are required fields");
    }

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
        throw new ApiError(409, "A user with this email already exists");
    }

    // 2. Hash the password using bcrypt (10 rounds of salting)
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'organizer' ? 'organizer' : 'attendee';

    // 3. Save the hashed password, NOT the plain text one
    const newUser = await pool.query(
        `INSERT INTO users (name, email, phone, role, password) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, email, role, created_at`,
        [name, email, phone, userRole, hashedPassword] // Insert hashed password
    );

    return res.status(201).json(
        new ApiResponse(201, newUser.rows[0], "User registered successfully!")
    );
});


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
        throw new ApiError(404, "User does not exist");
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // --- GENERATE BOTH TOKENS ---
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id);

    // Remove sensitive info before sending to frontend
    delete user.password;
    delete user.refresh_token; 

    // --- SEND TOKENS IN HTTP-ONLY COOKIES (The Pro Move) ---
    const options = {
        httpOnly: true, // Prevents hackers from accessing cookies via JavaScript (XSS attacks)
        secure: true    // Only sends cookies over HTTPS in production
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                { user, accessToken, refreshToken }, 
                "User logged in successfully"
            )
        );
});

// Export both functions
export { registerUser, loginUser };