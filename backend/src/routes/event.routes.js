import { Router } from 'express';
import { createEvent, getAllEvents, getOrganizerAnalytics } from '../controllers/event.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/create").post(verifyJWT, createEvent);
router.route("/all").get(getAllEvents);
router.route("/analytics").get(verifyJWT, getOrganizerAnalytics);

export default router;