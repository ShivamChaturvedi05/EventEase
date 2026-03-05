import { Router } from 'express';
import { createEvent, getAllEvents } from '../controllers/event.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/create").post(verifyJWT, createEvent);
router.route("/all").get(getAllEvents);

export default router;