import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Authentication } from './shared/services/authentication';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'fa-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconButton,
    MatIcon
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
    return this.isLoggedIn() && this.authService.isTrainer();
  }

  /**
   * Return whether the logged-in user is a participant.
   */
  protected isParticipant(): boolean {
    return this.isLoggedIn() && !this.isTrainer();
  }

  /**
   * Ask for confirmation before logging the user out.
   * Only clear the session if the user confirms the action.
   */
  protected logout(): void {
    const confirmed = confirm('Do you really want to log out?');

    if (confirmed) {
      this.authService.logout();
      this.router.navigateByUrl('/login');
    }
  }
}
