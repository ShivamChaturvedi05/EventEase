import { pool } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { emailQueue } from '../jobs/queue.js';
import Stripe from 'stripe';

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
            'SELECT title, available_seats, price FROM events WHERE id = $1 FOR UPDATE',
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

        await emailQueue.add('send-receipt', {
            userEmail: req.user.email,
            userName: req.user.name,
            eventTitle: event.title,
            ticketQuantity: ticket_quantity,
            totalAmount: total_amount
        });

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

const getUserBookings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT 
            b.id AS booking_id,
            b.ticket_quantity,
            b.total_amount,
            b.payment_status,
            b.booked_at,
            e.id AS event_id,
            e.title AS event_title,
            e.event_date,
            e.venue
        FROM bookings b
        JOIN events e ON b.event_id = e.id
        WHERE b.user_id = $1
        ORDER BY b.booked_at DESC;
    `;

    const result = await pool.query(query, [userId]);

    return res.status(200).json(
        new ApiResponse(200, result.rows, "User tickets fetched successfully!")
    );
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentOrder = asyncHandler(async (req, res) => {
    const { event_id, ticket_quantity = 1 } = req.body;

    if (!event_id) throw new ApiError(400, "event_id is required");

    const eventResult = await pool.query(
        'SELECT title, price, available_seats FROM events WHERE id = $1',
        [event_id]
    );

    if (eventResult.rows.length === 0) throw new ApiError(404, "Event not found");
    
    const event = eventResult.rows[0];
    
    if (event.available_seats < ticket_quantity) {
        throw new ApiError(400, "Not enough seats available!");
    }

    const unitAmountInPaise = event.price * 100;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: event.title,
                        },
                        unit_amount: unitAmountInPaise,
                    },
                    quantity: ticket_quantity,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:5173/dashboard?payment_status=success&event_id=${event_id}`,
            cancel_url: `http://localhost:5173/dashboard?payment_status=canceled`,
        });
        
        return res.status(200).json(
            new ApiResponse(200, {
                sessionId: session.id,
                checkoutUrl: session.url 
            }, "Stripe checkout session created")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to create Stripe session");
    }
});

export { bookTicket, getUserBookings, createPaymentOrder};