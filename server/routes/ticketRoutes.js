// server/routes/ticketRoutes.js
import express from 'express';
import {
  createTicket,
  getUserTickets,
  updateTicket,
  closeTicket,
  reopenTicket,
  upload, // <-- import upload
  getTicketById
} from '../controllers/ticketController.js';

const router = express.Router();

router.post('/', upload.single('image'), createTicket);
router.get('/', /*authMiddleware,*/ getUserTickets);
router.put('/:id', /*authMiddleware,*/ updateTicket);
router.patch('/:id/close', /*authMiddleware,*/ closeTicket);
router.patch('/:id/reopen', reopenTicket);
// router.get('/uploads/:filename', (req, res) => {
//   const filename = req.params.filename
// })
router.get('/:id', getTicketById);
export default router;
