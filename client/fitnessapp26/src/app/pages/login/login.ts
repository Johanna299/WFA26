import { Component, inject } from '@angular/core';
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
export class Login {
  // Build and manage the reactive login form.
  private fb = inject(FormBuilder);

  // Navigate after a successful login.
  private router = inject(Router);

  // Read query parameters from the current login route.
  private route = inject(ActivatedRoute);

  // Use the authentication service to send the login request.
  private authService = inject(Authentication);

  // Login form with validation rules
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  protected login(): void {
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
          // Navigate back to the originally requested page after login.
          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          console.error('Login failed', error);
        }
      });
    }
  }
}
