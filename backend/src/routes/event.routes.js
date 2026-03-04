import { Router } from 'express';
import { createEvent, getAllEvents } from '../controllers/event.controller.js';

const router = Router();

router.route("/create").post(createEvent);
router.route("/all").get(getAllEvents);

export default router;