import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { Difficulty } from '../difficulty';
import { API_URL } from '../api';

@Injectable({
  providedIn: 'root',
})
export class DifficultyStore {
  // Base URL of the Laravel REST API.
  private api = API_URL;

  // Inject Angular's HttpClient to send HTTP requests to the backend.
  private http = inject(HttpClient);

  /**
   * Load all difficulties from the backend API.
   */
  getAll(): Observable<Array<Difficulty>> {
    return this.http.get<Array<Difficulty>>(`${this.api}/difficulties`)
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
