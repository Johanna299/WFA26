import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

// Describe the structure of the decoded JWT payload token
interface Token {
  exp: number;
  user: {
    id: number;
    is_trainer: boolean;
  };
}

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
   * Decode the JWT and store relevant session data in sessionStorage.
   */
  public setSessionStorage(token: string): void {
    // Decode the JWT so the frontend can read its payload.
    const decodedToken = jwtDecode(token) as Token;

    //Store the token, userId & isTrainer in sessionStorage
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('userId', decodedToken.user.id.toString());
    sessionStorage.setItem('isTrainer', decodedToken.user.is_trainer.toString());
  }

  /**
   * Remove the stored session data and send the logout request to the backend.
   */
  public logout(): void {
    this.http.post(`${this.api}/logout`, {}).subscribe();

    // Remove all locally stored session information.
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('isTrainer');
  }

  /**
   * Return true if a valid token exists in the current session.
   * If the token is expired, remove the stored session data.
   */
  public isLoggedIn(): boolean {
    // Check whether a token exists in session storage.
    if (sessionStorage.getItem('token')) {
      const token = sessionStorage.getItem('token') as string;
      // Decode the stored token
      const decodedToken = jwtDecode(token) as Token;
      // Read its expiration timestamp & convert it into JS Date object
      const expirationDate = new Date(0);
      expirationDate.setUTCSeconds(decodedToken.exp);

      // If the token is already expired, remove the stored session data.
      if (expirationDate < new Date()) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('isTrainer');
        return false;
      }

      // Token exists and is still valid.
      return true;
    } else {
      // No token exists, so the user is not logged in.
      return false;
    }
  }

  /**
   * Return the stored JWT token.
   */
  public getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  /**
   * Return the stored user ID.
   */
  public getUserId(): number | null {
    const userId = sessionStorage.getItem('userId');
    return userId ? Number(userId) : null;
  }

  /**
   * Return true if the logged-in user is a trainer.
   */
  public isTrainer(): boolean {
    return sessionStorage.getItem('isTrainer') === 'true';
  }
}
