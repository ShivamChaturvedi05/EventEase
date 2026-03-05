import { Router } from 'express';
import { bookTicket } from '../controllers/booking.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/book").post(verifyJWT, bookTicket);

export default router;