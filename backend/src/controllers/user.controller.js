import { pool } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, phone, role } = req.body;

    if (!name || !email || !phone) {
        throw new ApiError(400, "Name, email, and phone are required fields");
    }

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
        throw new ApiError(409, "A user with this email already exists");
    }

    const userRole = role === 'organizer' ? 'organizer' : 'attendee';

    const newUser = await pool.query(
        `INSERT INTO users (name, email, phone, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, role, created_at`,
        [name, email, phone, userRole]
    );

    return res.status(201).json(
        new ApiResponse(201, newUser.rows[0], "User registered successfully!")
    );
});

export { registerUser };