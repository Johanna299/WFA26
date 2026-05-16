import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Authentication } from './authentication';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptor implements HttpInterceptor {
  // Use the authentication service to access the stored JWT token.
  private authService = inject(Authentication);

  /**
   * Intercept every outgoing HTTP request.
   * If a JWT token exists, add it to the Authorization header.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Read the stored token from the authentication service.
    const token = this.authService.getToken();

    // Only attach the Authorization header if a token exists.
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Forward the modified or unmodified request to the next handler.
    return next.handle(request);
  }
}
