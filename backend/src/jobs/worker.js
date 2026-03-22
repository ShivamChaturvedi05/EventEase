import { Worker } from 'bullmq';
import Redis from 'ioredis';
import nodemailer from 'nodemailer';

const redisConnection = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const emailWorker = new Worker('email-queue', async (job) => {
    
    console.log(`\n⚙️ [WORKER] Picked up job #${job.id}: Sending real receipt to ${job.data.userEmail}`);
    
    const { userEmail, userName, eventTitle, ticketQuantity, totalAmount } = job.data;

    const mailOptions = {
        from: `"EventEase Tickets" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: `Your Tickets for ${eventTitle} 🎟️`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #4f46e5;">Ticket Confirmation</h2>
                <p>Hi <strong>${userName}</strong>,</p>
                <p>Thank you for booking with EventEase! Your transaction was successful.</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>Event:</strong> ${eventTitle}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Quantity:</strong> ${ticketQuantity} Ticket(s)</p>
                    <p style="margin: 0;"><strong>Total Paid:</strong> ₹${totalAmount}</p>
                </div>

                <p>You can view your full digital tickets in your Attendee Dashboard.</p>
                <br/>
                <p style="color: #64748b; font-size: 12px;">This is an automated message from your EventEase platform.</p>
            </div>
        `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ [WORKER] Successfully sent email to ${userEmail}. Message ID: ${info.messageId}\n`);
    
}, { connection: redisConnection });

emailWorker.on('failed', (job, err) => {
    console.error(`❌ [WORKER] Job #${job.id} failed to send email:`, err.message);
});

console.log("Node.js Worker is running and waiting for jobs...");