// server/routes/publicRoutes.js
import express from 'express';
import { getUnits } from '../controllers/publicController.js';

const router = express.Router();

// Publicly accessible route to get units
router.get('/units', getUnits);

export default router;