import { Router } from 'express';
import { bookTicket, getUserBookings, createPaymentOrder } from '../controllers/booking.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
router.route("/create-checkout-session").post(verifyJWT, createPaymentOrder);
router.route("/book").post(verifyJWT, bookTicket);
router.route("/my-tickets").get(verifyJWT, getUserBookings);

export default router;