import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { Booking } from '../booking';
import {API_URL} from '../api';

@Injectable({
  providedIn: 'root',
})
export class BookingStore {
  // Base URL of the Laravel REST API.
  // All booking-related requests are built from this URL.
  private api = API_URL;

  // Inject Angular's HttpClient to send HTTP requests to the backend.
  private http = inject(HttpClient);

  /**
   * Load all bookings from the backend API.
   * The backend returns an array of bookings of the current user.
   */
  getAll(): Observable<Array<Booking>> {
    return this.http.get<Array<Booking>>(`${this.api}/bookings`)
      .pipe(retry(3))
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Cancel one booking by its ID.
   */
  cancel(id: number): Observable<Booking> {
    // empty request body because of changing only the status
    return this.http.put<Booking>(`${this.api}/bookings/${id}/cancel`, {})
      .pipe(retry(3))
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Create a new booking for one appointment
   * for the currently authenticated user.
   * BE determines the currently authenticated user
   * from the JWT token
   */
  create(appointmentId: number): Observable<Booking> {
    // selected appointment ID in request body
    return this.http.post<Booking>(`${this.api}/bookings`, {
      appointment_id: appointmentId
    })
      .pipe(retry(3))
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Forward HTTP errors so the calling component can handle them.
   */
  private errorHandler(error: Error | any): Observable<any> {
    return throwError(() => error);
  }
}
