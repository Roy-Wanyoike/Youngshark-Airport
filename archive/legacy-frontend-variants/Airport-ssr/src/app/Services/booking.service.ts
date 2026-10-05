import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Observable } from 'rxjs';
import { AddBooking, Booking, Message } from '../Interfaces';

/**
 * Legacy Angular 15 SSR booking service — modernised for Vercel.
 *
 * Same pattern as AuthenticationService: relative `/api` on the browser,
 * `process.env.BACKEND_URL + '/api'` on the server.
 *
 * Removed: unused `booking$ = new Subject<Booking[]>()` (dead state).
 */
@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly isServer: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isServer = isPlatformServer(platformId);
  }

  private get baseUrl(): string {
    if (this.isServer && typeof process !== 'undefined' && process.env?.BACKEND_URL) {
      return process.env.BACKEND_URL + '/api';
    }
    return '/api';
  }

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
