import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { Appointment } from '../appointment';
import { API_URL } from '../api';

@Injectable({
  providedIn: 'root',
})
export class AppointmentStore {
  // Base URL of the Laravel REST API
  private api = API_URL;

  // Inject Angular's HttpClient to send HTTP requests to the backend
  private http = inject(HttpClient);

  /**
   * Load all appointments from the backend API.
   * sends a GET request to /api/appointments
   * and expects an array of Appointment objects as response.
   */
  getAll(): Observable<Array<Appointment>> {
    return this.http.get<Array<Appointment>>(`${this.api}/appointments`)
      // Retry the request up to 3 times if a temporary error occurs.
      .pipe(retry(3))
      // Forward the error to the custom error handler.
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Load one single appointment by its ID
   * sends a GET request to /api/appointments/{id}
   * and expects one Appointment object as response.
   */
  getSingle(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.api}/appointments/${id}`)
      // Retry the request up to 3 times if a temporary error occurs.
      .pipe(retry(3))
      // Forward the error to the custom error handler.
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Create a new appointment in the backend.
   */
  create(appointmentData: {
    course_id: number;
    starts_at: string;
    duration: number;
  }): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.api}/appointments`, appointmentData)
      .pipe(retry(3))
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Update an existing appointment in the backend.
   */
  update(id: number, appointmentData: {
    course_id?: number;
    starts_at?: string;
    duration?: number;
    status?: string;
  }): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.api}/appointments/${id}`, appointmentData)
      .pipe(retry(3))
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Delete one appointment by its ID.
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/appointments/${id}`)
      .pipe(retry(3))
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Handle HTTP errors of this service.
   * The error is passed on so the calling component
   * can react to it if needed.
   */
  private errorHandler(error: Error | any): Observable<any> {
    return throwError(() => error);
  }
}
