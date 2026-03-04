import { pool } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createEvent = asyncHandler(async (req, res) => {
    const { title, description, event_date, venue, price, total_seats, organizer_id } = req.body;

    if (!title || !description || !event_date || !venue || price === undefined || !total_seats || !organizer_id) {
        throw new ApiError(400, "All event fields are required");
    }

    const newEvent = await pool.query(
        `INSERT INTO events (title, description, event_date, venue, price, total_seats, available_seats, organizer_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [
            title, 
            description, 
            event_date, 
            venue, 
            price, 
            total_seats, 
            total_seats,
            organizer_id
        ]
    );

    return res.status(201).json(
        new ApiResponse(201, newEvent.rows[0], "Event created successfully!")
    );
});

const getAllEvents = asyncHandler(async (req, res) => {
    const events = await pool.query(
        `SELECT * FROM events 
         WHERE status = 'upcoming' 
         ORDER BY event_date ASC`
    );

    return res.status(200).json(
        new ApiResponse(200, events.rows, "Events fetched successfully!")
    );
});

export { createEvent, getAllEvents };