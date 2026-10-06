"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flights_controller_1 = require("../controllers/flights.controller");
const auth_1 = require("../middleware/auth");
const flightsRouter = (0, express_1.Router)();
// All flight endpoints require authentication (matches the original contract).
flightsRouter.use(auth_1.verifyTokenMiddleware);
// ⚠️ Order matters — `/booking/emails` must be declared BEFORE `/:id`,
// otherwise Express would treat "booking" as an :id param.
flightsRouter.get('/booking/emails', flights_controller_1.getBookingsByEmail);
flightsRouter.get('/:id', flights_controller_1.getOneBooking);
flightsRouter.get('/', flights_controller_1.getBookings);
flightsRouter.post('/', flights_controller_1.addBooking);
flightsRouter.put('/:id', flights_controller_1.updateBooking);
flightsRouter.delete('/:id', flights_controller_1.cancelBooking);
exports.default = flightsRouter;
//# sourceMappingURL=flights.routes.js.map