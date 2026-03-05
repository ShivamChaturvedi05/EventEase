import dotenv from 'dotenv';
import { getPool, connectDB } from './index.js';

dotenv.config({ path: './.env' });

const createTables = async () => {
    try {
        await connectDB();
        const pool = getPool();
        console.log("⏳ Initializing database tables...");

        // 1. Create Custom Types
        await pool.query(`
            DO $$ BEGIN
                CREATE TYPE user_role AS ENUM ('attendee', 'organizer');
                CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
                CREATE TYPE booking_status AS ENUM ('pending', 'successful', 'failed', 'refunded');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // 2. Create Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                role user_role DEFAULT 'attendee',
                refresh_token VARCHAR(500),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Create Events Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                event_date TIMESTAMP WITH TIME ZONE NOT NULL,
                venue VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
                total_seats INTEGER NOT NULL CHECK (total_seats > 0),
                available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
                organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                status event_status DEFAULT 'upcoming',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. Create Bookings Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
                payment_status booking_status DEFAULT 'pending',
                gateway_order_id VARCHAR(255) NOT NULL,
                transaction_id VARCHAR(255),
                ticket_quantity INTEGER NOT NULL DEFAULT 1 CHECK (ticket_quantity > 0),
                total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
                booked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("All tables created successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error creating tables: ", error);
        process.exit(1);
    }
};

createTables();