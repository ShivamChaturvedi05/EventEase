import { pool } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createEvent = asyncHandler(async (req, res) => {
    const { title, description, event_date, venue, price, total_seats } = req.body;

    const organizer_id = req.user.id; 

    if (!title || !description || !event_date || !venue || price === undefined || !total_seats) {
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

const getOrganizerAnalytics = asyncHandler(async (req, res) => {

    const organizerId = req.user.id;

    const query = `
        SELECT 
            e.id AS event_id,
            e.title,
            e.event_date,
            e.total_seats,
            e.available_seats,
            e.price,
            (e.total_seats - e.available_seats) AS tickets_sold,
            ((e.total_seats - e.available_seats) * e.price) AS total_revenue,
            
            -- This magic function packs all the attendees into a JSON array!
            COALESCE(
                json_agg(
                    json_build_object(
                        'attendee_name', u.name,
                        'attendee_email', u.email,
                        'ticket_quantity', b.ticket_quantity,
                        'booked_at', b.booked_at
                    )
                ) FILTER (WHERE b.id IS NOT NULL), '[]'
            ) AS recent_bookings
            
        FROM events e
        LEFT JOIN bookings b ON e.id = b.event_id
        LEFT JOIN users u ON b.user_id = u.id
        WHERE e.organizer_id = $1
        GROUP BY e.id
        ORDER BY e.created_at DESC;
    `;

    const result = await pool.query(query, [organizerId]);

    return res.status(200).json(
        new ApiResponse(200, result.rows, "Organizer analytics fetched successfully!")
    );
});

export { createEvent, getAllEvents, getOrganizerAnalytics };