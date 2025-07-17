// server/routes/publicRoutes.js
import express from 'express';
import { getPublicUnits } from '../controllers/publicController.js';

const router = express.Router();

// Publicly accessible route to get units
router.get('/units', getPublicUnits);

export default router;