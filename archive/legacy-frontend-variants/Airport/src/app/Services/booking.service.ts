import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddBooking, Booking, Message } from '../Interfaces';

/**
 * Legacy Angular 15 SPA booking service — modernised for Vercel deployment.
 *
 * Originally hardcoded `http://localhost:4002`. Now uses relative `/api` URLs
 * so Vercel's top-level rewrites route the requests to the backend service.
 *
 * Removed: the unused `booking$ = new Subject<Booking[]>()` field (dead state).
 */
@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  addBooking(booking: AddBooking): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/flights`, booking);
  }

  getUserBooking(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/flights/booking/emails`);
  }

  getOneBooking(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/flights/${id}`);
  }

  deleteBooking(id: string): Observable<Message> {
    return this.http.delete<Message>(`${this.baseUrl}/flights/${id}`);
  }

  updateBooking(id: string, updatedBooking: AddBooking): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/flights/${id}`, updatedBooking);
  }
}
