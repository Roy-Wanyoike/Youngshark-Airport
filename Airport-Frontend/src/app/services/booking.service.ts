import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AddBooking, Booking, Message } from '../shared/interfaces';

/**
 * BookingService — thin HTTP wrapper.
 *
 * Endpoint contract preserved exactly:
 *   POST   /flights                     body: AddBooking   → Message
 *   GET    /flights/booking/emails                          → Booking[]
 *   GET    /flights/:id                                     → Booking
 *   DELETE /flights/:id                                     → Message
 *   PUT    /flights/:id                  body: AddBooking   → Booking
 *
 * Removed: the unused `booking$ = new Subject<Booking[]>()` field (dead state).
 */
@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

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
