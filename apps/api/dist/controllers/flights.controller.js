"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookings = getBookings;
exports.getBookingsByEmail = getBookingsByEmail;
exports.getOneBooking = getOneBooking;
exports.addBooking = addBooking;
exports.updateBooking = updateBooking;
exports.cancelBooking = cancelBooking;
const uuid_1 = require("uuid");
const db_1 = require("../services/db");
const index_1 = require("../schemas/index");
/**
 * Flight booking controller — CRUD against the FlightBookings table via
 * stored procedures.
 *
 * Endpoints (mounted under /api/flights):
 *   GET    /                 — all bookings (admin) or all (then filtered client-side)
 *   GET    /booking/emails  — bookings for the authed user
 *   GET    /:id              — single booking
 *   POST   /                 — create
 *   PUT    /:id              — update
 *   DELETE /:id              — delete
 */
async function getBookings(_req, res) {
    try {
        const result = await db_1.db.exec('getFlights');
        return res.status(200).json(result.recordset);
    }
    catch (error) {
        console.error('[flights.getBookings]', error);
        return res.status(500).json({ error: 'Failed to load bookings', detail: error.message });
    }
}
async function getBookingsByEmail(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    try {
        const result = await db_1.db.exec('getByEmail', { email: req.user.Email });
        const bookings = result.recordset;
        if (!bookings.length) {
            return res.status(404).json({ error: 'No bookings found' });
        }
        return res.status(200).json(bookings);
    }
    catch (error) {
        console.error('[flights.getByEmail]', error);
        return res.status(500).json({ error: 'Failed to load bookings', detail: error.message });
    }
}
async function getOneBooking(req, res) {
    try {
        const result = await db_1.db.exec('getFlightBookings', { id: req.params.id });
        const booking = result.recordset[0];
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        return res.status(200).json(booking);
    }
    catch (error) {
        console.error('[flights.getOne]', error);
        return res.status(500).json({ error: 'Failed to load booking', detail: error.message });
    }
}
async function addBooking(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const { error } = index_1.addBookingSchema.validate(req.body);
    if (error) {
        return res.status(422).json({ error: error.details[0].message });
    }
    const id = (0, uuid_1.v4)();
    const { Destination, TravelDate } = req.body;
    try {
        await db_1.db.exec('InsertOrUpdate', {
            id,
            name: req.user.Name,
            email: req.user.Email,
            destination: Destination,
            date: TravelDate,
        });
        return res.status(201).json({ message: 'Booking added' });
    }
    catch (error) {
        console.error('[flights.add]', error);
        return res.status(500).json({ error: 'Failed to add booking', detail: error.message });
    }
}
async function updateBooking(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const { error } = index_1.updateBookingSchema.validate(req.body);
    if (error) {
        return res.status(422).json({ error: error.details[0].message });
    }
    const { Destination, TravelDate } = req.body;
    try {
        const existing = await db_1.db.exec('getFlightBookings', { id: req.params.id });
        if (!existing.recordset[0]) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        await db_1.db.exec('InsertOrUpdate', {
            id: req.params.id,
            name: req.user.Name,
            email: req.user.Email,
            destination: Destination,
            date: TravelDate,
        });
        const updated = await db_1.db.exec('getFlightBookings', { id: req.params.id });
        return res.status(200).json(updated.recordset[0]);
    }
    catch (error) {
        console.error('[flights.update]', error);
        return res.status(500).json({ error: 'Failed to update booking', detail: error.message });
    }
}
async function cancelBooking(req, res) {
    try {
        const existing = await db_1.db.exec('getFlightBookings', { id: req.params.id });
        if (!existing.recordset[0]) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        await db_1.db.exec('deleteFlightBookings', { id: req.params.id });
        return res.status(200).json({ message: 'Booking deleted' });
    }
    catch (error) {
        console.error('[flights.delete]', error);
        return res.status(500).json({ error: 'Failed to delete booking', detail: error.message });
    }
}
//# sourceMappingURL=flights.controller.js.map