import dotenv from 'dotenv';
import { connectDB } from './db/index.js';
import { app } from './app.js'; 
import './jobs/worker.js';

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        
        app.listen(PORT, () => {
            console.log(`⚙️  Server is running at port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("❌ Database connection failed !!! ", err);
    });