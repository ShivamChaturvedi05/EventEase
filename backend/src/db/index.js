import pg from 'pg';

const { Pool } = pg;

let pool;

const getPool = () => pool;

const connectDB = async () => {
    try {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
        const client = await pool.connect();
        
        console.log(`\n⚙️  PostgreSQL Connected! DB Host: ${client.host}`);

        client.release(); 
    } catch (error) {
        console.error("\n❌ PostgreSQL connection FAILED: ", error);

        process.exit(1);
    }
};


export { pool, getPool, connectDB };