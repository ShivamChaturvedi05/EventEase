import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { pool } from '../db/index.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const userResult = await pool.query(
            'SELECT id, name, email, role FROM users WHERE id = $1', 
            [decodedToken._id]
        );

        if (userResult.rows.length === 0) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = userResult.rows[0];

        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});