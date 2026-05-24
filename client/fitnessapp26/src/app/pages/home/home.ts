import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { Authentication } from '../../shared/services/authentication';

@Component({
  selector: 'fa-home',
  standalone: true,
  imports: [RouterLink, MatButton],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  // Use the authentication service to check whether a user is logged in
  // and whether the user is a trainer or participant
  private authService = inject(Authentication);

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
    return this.authService.isLoggedIn() && this.authService.isTrainer();
  }

  /**
   * Return whether the logged-in user is a participant.
   */
  protected isParticipant(): boolean {
    return this.authService.isLoggedIn() && !this.authService.isTrainer();
  }
}
