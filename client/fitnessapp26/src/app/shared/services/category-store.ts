import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { Category } from '../category';
import { API_URL } from '../api';

@Injectable({
  providedIn: 'root',
})
export class CategoryStore {
  // Base URL of the Laravel REST API.
  private api = API_URL;

  // Inject Angular's HttpClient to send HTTP requests to the backend.
  private http = inject(HttpClient);

  /**
   * Load all categories from the backend API.
   */
  getAll(): Observable<Array<Category>> {
    return this.http.get<Array<Category>>(`${this.api}/categories`)
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
