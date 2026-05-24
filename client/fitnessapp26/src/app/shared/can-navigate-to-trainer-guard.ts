import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Authentication } from './services/authentication';
import { ToastrService } from 'ngx-toastr';

export const canNavigateToTrainerGuard: CanActivateFn = (route, state) => {
  const authService = inject(Authentication);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  // Redirect unauthenticated users to the login page
  if (!authService.isLoggedIn()) {
    toastr.error('You are not allowed to enter this route. Please log in first.');
    router.navigateByUrl('/login');
    return false;
  }

  // Allow access only for trainers
  if (authService.isTrainer()) {
    return true;
  }

  // Redirect logged-in non-trainers away from trainer-only pages
  toastr.error('You are not allowed to enter this trainer route.');
  router.navigateByUrl('/home');
  return false;
};
