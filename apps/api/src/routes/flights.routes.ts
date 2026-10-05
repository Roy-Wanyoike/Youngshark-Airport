import { Router } from 'express';
import {
  getBookings,
  getBookingsByEmail,
  getOneBooking,
  addBooking,
  updateBooking,
  cancelBooking,
} from '../controllers/flights.controller.js';
import { verifyTokenMiddleware } from '../middleware/auth.js';

const flightsRouter = Router();

// All flight endpoints require authentication (matches the original contract).
flightsRouter.use(verifyTokenMiddleware);

// ⚠️ Order matters — `/booking/emails` must be declared BEFORE `/:id`,
// otherwise Express would treat "booking" as an :id param.
flightsRouter.get('/booking/emails', getBookingsByEmail);
flightsRouter.get('/:id', getOneBooking);
flightsRouter.get('/', getBookings);
flightsRouter.post('/', addBooking);
flightsRouter.put('/:id', updateBooking);
flightsRouter.delete('/:id', cancelBooking);

export default flightsRouter;
