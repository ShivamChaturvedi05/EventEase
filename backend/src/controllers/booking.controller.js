import { pool } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const bookTicket = asyncHandler(async (req, res) => {
    const { event_id, ticket_quantity = 1 } = req.body;

    const user_id = req.user.id; 

    if (!event_id) {
        throw new ApiError(400, "event_id is required");
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN'); 

        const eventResult = await client.query(
            'SELECT available_seats, price FROM events WHERE id = $1 FOR UPDATE',
            [event_id]
        );

        if (eventResult.rows.length === 0) {
            throw new ApiError(404, "Event not found");
        }

        const event = eventResult.rows[0];

        if (event.available_seats < ticket_quantity) {
            throw new ApiError(400, "Not enough seats available! Sold out.");
        }

        const total_amount = event.price * ticket_quantity;
        const gateway_order_id = `ORDER_MOCK_${Date.now()}`;

        await client.query(
            'UPDATE events SET available_seats = available_seats - $1 WHERE id = $2',
            [ticket_quantity, event_id]
        );

        const bookingResult = await client.query(
            `INSERT INTO bookings (user_id, event_id, ticket_quantity, total_amount, gateway_order_id, payment_status)
             VALUES ($1, $2, $3, $4, $5, 'successful') 
             RETURNING *`,
            [user_id, event_id, ticket_quantity, total_amount, gateway_order_id]
        );

        await client.query('COMMIT'); 

        return res.status(201).json(
            new ApiResponse(201, bookingResult.rows[0], "Ticket booked successfully!")
        );

    } catch (error) {
        await client.query('ROLLBACK'); 
        throw error;
    } finally {
        client.release(); 
    }
});

export { bookTicket };