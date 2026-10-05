import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { Booking } from 'src/app/shared/interfaces';
import {
  addBookingFail,
  addBookingSuccess,
  clearBookingStatus,
  deleteBookingFail,
  deleteBookingSuccess,
  getBookingFail,
  getBookingsSuccess,
  getSingleBookingId,
  updateBookingFail,
  updateBookingSuccess,
} from '../actions/booking.actions';

export interface BookingState {
  bookings: Booking[];
  bookingId: string;
  loading: boolean;
  error: string;
  addSuccess: string;
  addError: string;
  updateError: string;
  updateSuccess: string;
  deleteSuccess: string;
  deleteError: string;
}

const initialState: BookingState = {
  bookings: [],
  bookingId: '',
  loading: false,
  error: '',
  addSuccess: '',
  addError: '',
  updateError: '',
  updateSuccess: '',
  deleteSuccess: '',
  deleteError: '',
};

const selectBookingState = createFeatureSelector<BookingState>('booking');

export const selectAllBookings = createSelector(
  selectBookingState,
  (s) => s.bookings,
);
export const selectBookingsLoading = createSelector(
  selectBookingState,
  (s) => s.loading,
);
export const selectBookingsError = createSelector(
  selectBookingState,
  (s) => s.error,
);
export const selectSelectedBookingId = createSelector(
  selectBookingState,
  (s) => s.bookingId,
);
export const selectSelectedBooking = createSelector(
  selectAllBookings,
  selectSelectedBookingId,
  (bookings, id) => bookings.find((b) => b.Id === id),
);
export const selectAddSuccess = createSelector(
  selectBookingState,
  (s) => s.addSuccess,
);
export const selectAddError = createSelector(
  selectBookingState,
  (s) => s.addError,
);
export const selectDeleteSuccess = createSelector(
  selectBookingState,
  (s) => s.deleteSuccess,
);

export const bookingReducer = createReducer<BookingState>(
  initialState,
  on(getBookingsSuccess, (_, a): BookingState => ({
    ...initialState,
    bookings: a.bookings,
    loading: false,
  })),
  on(getBookingFail, (state, a): BookingState => ({
    ...state,
    bookings: [],
    loading: false,
    error: a.error,
  })),
  on(getSingleBookingId, (state, a): BookingState => ({
    ...state,
    bookingId: a.id,
  })),
  on(addBookingSuccess, (state, a): BookingState => ({
    ...state,
    addError: '',
    addSuccess: a.message.message,
  })),
  on(addBookingFail, (state, a): BookingState => ({
    ...state,
    addError: a.error,
    addSuccess: '',
  })),
  on(updateBookingSuccess, (state, a): BookingState => {
    const bookings = state.bookings.map((b) =>
      b.Id === a.booking.Id ? a.booking : b,
    );
    return { ...state, updateError: '', updateSuccess: 'Booking updated', bookings };
  }),
  on(updateBookingFail, (state, a): BookingState => ({
    ...state,
    updateError: a.error,
  })),
  on(deleteBookingSuccess, (state, a): BookingState => ({
    ...state,
    deleteError: '',
    deleteSuccess: a.message.message,
  })),
  on(deleteBookingFail, (state, a): BookingState => ({
    ...state,
    deleteError: a.error,
    deleteSuccess: '',
  })),
  on(clearBookingStatus, (state): BookingState => ({
    ...state,
    error: '',
    addSuccess: '',
    addError: '',
    updateError: '',
    updateSuccess: '',
    deleteSuccess: '',
    deleteError: '',
  })),
);
