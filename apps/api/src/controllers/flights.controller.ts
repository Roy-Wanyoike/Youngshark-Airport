import type { Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../services/db.js';
import { addBookingSchema, updateBookingSchema } from '../schemas/index.js';
import type { AuthedRequest } from '../middleware/auth.js';

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

export async function getBookings(_req: AuthedRequest, res: Response) {
  try {
    const result = await db.exec('getFlights');
    return res.status(200).json(result.recordset);
  } catch (error: any) {
    console.error('[flights.getBookings]', error);
    return res.status(500).json({ error: 'Failed to load bookings', detail: error.message });
  }
}

export async function getBookingsByEmail(req: AuthedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const result = await db.exec('getByEmail', { email: req.user.Email });
    const bookings = result.recordset;
    if (!bookings.length) {
      return res.status(404).json({ error: 'No bookings found' });
    }
    return res.status(200).json(bookings);
  } catch (error: any) {
    console.error('[flights.getByEmail]', error);
    return res.status(500).json({ error: 'Failed to load bookings', detail: error.message });
  }
}

export async function getOneBooking(req: AuthedRequest, res: Response) {
  try {
    const result = await db.exec('getFlightBookings', { id: req.params.id });
    const booking = result.recordset[0];
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    return res.status(200).json(booking);
  } catch (error: any) {
    console.error('[flights.getOne]', error);
    return res.status(500).json({ error: 'Failed to load booking', detail: error.message });
  }
}

export async function addBooking(req: AuthedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const { error } = addBookingSchema.validate(req.body);
  if (error) {
    return res.status(422).json({ error: error.details[0].message });
  }
  const id = uuid();
  const { Destination, TravelDate } = req.body;
  try {
    await db.exec('InsertOrUpdate', {
      id,
      name: req.user.Name,
      email: req.user.Email,
      destination: Destination,
      date: TravelDate,
    });
    return res.status(201).json({ message: 'Booking added' });
  } catch (error: any) {
    console.error('[flights.add]', error);
    return res.status(500).json({ error: 'Failed to add booking', detail: error.message });
  }
}

export async function updateBooking(req: AuthedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const { error } = updateBookingSchema.validate(req.body);
  if (error) {
    return res.status(422).json({ error: error.details[0].message });
  }
  const { Destination, TravelDate } = req.body;
  try {
    const existing = await db.exec('getFlightBookings', { id: req.params.id });
    if (!existing.recordset[0]) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    await db.exec('InsertOrUpdate', {
      id: req.params.id,
      name: req.user.Name,
      email: req.user.Email,
      destination: Destination,
      date: TravelDate,
    });
    const updated = await db.exec('getFlightBookings', { id: req.params.id });
    return res.status(200).json(updated.recordset[0]);
  } catch (error: any) {
    console.error('[flights.update]', error);
    return res.status(500).json({ error: 'Failed to update booking', detail: error.message });
  }
}

export async function cancelBooking(req: AuthedRequest, res: Response) {
  try {
    const existing = await db.exec('getFlightBookings', { id: req.params.id });
    if (!existing.recordset[0]) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    await db.exec('deleteFlightBookings', { id: req.params.id });
    return res.status(200).json({ message: 'Booking deleted' });
  } catch (error: any) {
    console.error('[flights.delete]', error);
    return res.status(500).json({ error: 'Failed to delete booking', detail: error.message });
  }
}
