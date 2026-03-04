import dotenv from 'dotenv';
import { connectDB } from './db/index.js';

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {

        console.log(`⚙️  Server is ready to be started on port : ${PORT}`);
    })
    .catch((err) => {
        console.log("❌ Database connection failed !!! ", err);
    });