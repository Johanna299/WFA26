import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { Course } from '../course';
import {API_URL} from '../api';

@Injectable({
  providedIn: 'root',
})
export class CourseStore {
  // Base URL of the Laravel REST API.
  // All course-related requests are built from this URL.
  private api = API_URL;

  // Inject Angular's HttpClient to send HTTP requests to the backend.
  http = inject(HttpClient);

  /**
   * Load all courses from the backend API.
   * This sends a GET request to /api/courses
   * and expects an array of Course objects as response.
   */
  getAll(): Observable<Array<Course>> {
    return this.http.get<Array<Course>>(`${this.api}/courses`)
      // Retry the request up to 3 times if a temporary error occurs.
      .pipe(retry(3))
      // Forward the error to the custom error handler.
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Load one single course by its ID.
   * This sends a GET request to /api/courses/{id}
   * and expects one Course object as response.
   */
  getSingle(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.api}/courses/${id}`)
      // Retry the request up to 3 times if a temporary error occurs.
      .pipe(retry(3))
      // Forward the error to the custom error handler.
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Create a new course in the backend.
   */
  create(courseData: {
    title: string;
    description: string | null;
    location: string;
    participant_limit: number;
    difficulty_id: number;
    category_ids: number[];
  }): Observable<Course> {
    return this.http.post<Course>(`${this.api}/courses`, courseData)
      .pipe(retry(3))
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Update an existing course in the backend.
   */
  update(id: number, courseData: {
    title: string;
    description: string | null;
    location: string;
    participant_limit: number;
    difficulty_id: number;
    category_ids: number[];
  }): Observable<Course> {
    return this.http.put<Course>(`${this.api}/courses/${id}`, courseData)
      .pipe(retry(3))
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Delete one course by its ID.
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/courses/${id}`)
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
