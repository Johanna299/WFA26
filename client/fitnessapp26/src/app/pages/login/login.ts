import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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

  // Use the authentication service to send the login request.
  private authService = inject(Authentication);

  // Login form with validation rules
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  login(): void {
    // Get values from form fields.
    const val = this.loginForm.value;

    // Only send the request if both form fields contain values.
    if (val.email && val.password) {
      this.authService.login(val.email, val.password).subscribe({
        next: (response) => {
          console.log('Login successful', response);

          // Navigate to the home page after a successful login.
          // Token handling will be added in the next step.
          this.router.navigateByUrl('/home');
        },
        error: (error) => {
          console.error('Login failed', error);
        }
      });
    }
  }
}
