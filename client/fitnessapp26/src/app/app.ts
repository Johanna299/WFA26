import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { Authentication } from './shared/services/authentication';

@Component({
  selector: 'fa-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatTabNav,
    MatTabLink,
    MatTabNavPanel
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Use the authentication service to read the current login state.
  private authService = inject(Authentication);

  // Use the router to navigate after logout.
  private router = inject(Router);

  /**
   * Return whether a user is currently logged in.
   */
  protected isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Return whether the logged-in user is a trainer.
   */
  protected isTrainer(): boolean {
    return this.authService.isTrainer();
  }

  /**
   * Ask for confirmation before logging the user out.
   * If confirmed, clear the current session and navigate to the login page.
   */
  protected logout(): void {
    const confirmed = confirm('Do you really want to log out?');

    if (confirmed) {
      this.authService.logout();
      this.router.navigateByUrl('/login');
    }
  }
}
