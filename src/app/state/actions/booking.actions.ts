import { createAction, props } from '@ngrx/store';
import { Booking, AddBooking, Message } from 'src/app/shared/interfaces';

export const getBookings = createAction('[Booking] get bookings');
export const getBookingsSuccess = createAction(
  '[Booking] get bookings success',
  props<{ bookings: Booking[] }>(),
);
export const getBookingFail = createAction(
  '[Booking] get bookings fail',
  props<{ error: string }>(),
);

export const getSingleBookingId = createAction(
  '[Single Booking] get single booking id',
  props<{ id: string }>(),
);

export const addBooking = createAction(
  '[Add Booking] add booking',
  props<{ newBooking: AddBooking }>(),
);
export const addBookingSuccess = createAction(
  '[Add Booking] add booking success',
  props<{ message: Message }>(),
);
export const addBookingFail = createAction(
  '[Add Booking] add booking fail',
  props<{ error: string }>(),
);

export const updateBooking = createAction(
  '[Update Booking] update booking',
  props<{ updatedBooking: AddBooking; id: string }>(),
);
export const updateBookingSuccess = createAction(
  '[Update Booking] update booking success',
  props<{ booking: Booking }>(),
);
export const updateBookingFail = createAction(
  '[Update Booking] update booking fail',
  props<{ error: string }>(),
);

export const deleteBooking = createAction(
  '[Delete Booking] delete booking',
  props<{ id: string }>(),
);
export const deleteBookingSuccess = createAction(
  '[Delete Booking] delete booking success',
  props<{ message: Message }>(),
);
export const deleteBookingFail = createAction(
  '[Delete Booking] delete booking fail',
  props<{ error: string }>(),
);

/** Clear transient error / success flags after the UI has shown them. */
export const clearBookingStatus = createAction('[Booking] clear status');
