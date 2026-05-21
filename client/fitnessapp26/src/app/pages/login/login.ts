import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Authentication } from '../../shared/services/authentication';

@Component({
  selector: 'fa-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatError
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  // Build and manage the reactive login form.
  private fb = inject(FormBuilder);

  // Navigate after a successful login.
  private router = inject(Router);

  // Read query parameters from the current login route.
  private route = inject(ActivatedRoute);

  // Use the authentication service to send the login request.
  private authService = inject(Authentication);

  // Store visible login error message in a signal
  // so the template updates automatically
  protected loginError = signal('');

  // Login form with validation rules
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  ngOnInit(): void {
    // Clear the visible login error message
    // as soon as the user edits the input field
    this.loginForm.valueChanges.subscribe(() => {
      if (this.loginError()) {
        this.loginError.set('');
      }
    });
  }

  protected login(): void {
    // Clear old login errors before starting a new login attempt.
    this.loginError.set('');

    // Get values from form fields.
    const val = this.loginForm.value;

    // Only send the request if both form fields contain values.
    if (val.email && val.password) {
      this.authService.login(val.email, val.password).subscribe({
        next: (response: any) => {
          console.log('Login successful', response);

          // Store the received JWT token in the browser session.
          this.authService.setSessionStorage(response.access_token);

          // Read the optional return URL from the query parameters.
          // If no return URL exists, navigate to the home page.
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';

          // Read whether the login was triggered by a booking action.
          const bookingIntent = this.route.snapshot.queryParamMap.get('bookingIntent');

          // If the user tried to book a course but logged in as a trainer,
          // navigate back to the original page and show a booking error there.
          if (bookingIntent === 'true' && this.authService.isTrainer()) {
            this.router.navigateByUrl(`${returnUrl}?bookingError=trainer-not-allowed`);
            return;
          }

          // Otherwise navigate back to the originally requested page after login.
          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          console.error('Login failed', error);

          // Show error message if the login data is incorrect
          if (error.status === 401) {
            this.loginError.set('Invalid email or password. Please try again.');
          } else {
            this.loginError.set('Login failed. Please try again.');
          }
        }
      });
    }
  }
}
