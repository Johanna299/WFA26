import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Authentication {
  // Base URL of the authentication endpoints in the Laravel backend.
  private api = 'http://fitness-app.s2310456005.student.kwmhgb.at/api/auth';

  // Inject Angular's HttpClient to send authentication requests.
  private http = inject(HttpClient);

  /**
   * Send the login request to the backend.
   * The backend expects email and password in the request body.
   */
  login(email: string, password: string) {
    return this.http.post(`${this.api}/login`, {
      email: email,
      password: password
    });
  }

  /**
   * Send the logout request to the backend.
   * The token handling will be added in a later step.
   */
  logout() {
    return this.http.post(`${this.api}/logout`, {});
  }
}
