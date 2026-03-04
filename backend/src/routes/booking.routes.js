import { Router } from 'express';
import { bookTicket } from '../controllers/booking.controller.js';

const router = Router();

router.route("/book").post(bookTicket);

export default router;