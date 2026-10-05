import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, mergeMap, of } from 'rxjs';
import { BookingService } from 'src/app/services/booking.service';
import * as BookingsActions from '../actions/booking.actions';

@Injectable()
export class BookingsEffect {
  private bookingService = inject(BookingService);
  private actions$ = inject(Actions);

  loadBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingsActions.getBookings),
      mergeMap(() =>
        this.bookingService.getUserBooking().pipe(
          map((bookings) => BookingsActions.getBookingsSuccess({ bookings })),
          catchError((error) =>
            of(BookingsActions.getBookingFail({ error: error.message ?? 'Failed to load bookings' })),
          ),
        ),
      ),
    ),
  );

  addBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingsActions.addBooking),
      concatMap((action) =>
        this.bookingService.addBooking(action.newBooking).pipe(
          map((message) => BookingsActions.addBookingSuccess({ message })),
          catchError((error) =>
            of(BookingsActions.addBookingFail({ error: error.message ?? 'Failed to add booking' })),
          ),
        ),
      ),
    ),
  );

  updateBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingsActions.updateBooking),
      concatMap((action) =>
        this.bookingService.updateBooking(action.id, action.updatedBooking).pipe(
          map((booking) => BookingsActions.updateBookingSuccess({ booking })),
          catchError((error) =>
            of(
              BookingsActions.updateBookingFail({
                error: error.message ?? 'Failed to update booking',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  deleteBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingsActions.deleteBooking),
      concatMap((action) =>
        this.bookingService.deleteBooking(action.id).pipe(
          map((message) => BookingsActions.deleteBookingSuccess({ message })),
          catchError((error) =>
            of(
              BookingsActions.deleteBookingFail({
                error: error.message ?? 'Failed to delete booking',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
