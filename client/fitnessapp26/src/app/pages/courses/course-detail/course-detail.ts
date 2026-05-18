import { Component, inject, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CourseStore } from '../../../shared/services/course-store';
import { DatePipe } from '@angular/common';
import { BookingStore } from '../../../shared/services/booking-store';
import { Authentication } from '../../../shared/services/authentication';
import { Appointment } from '../../../shared/appointment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fa-course-detail',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatDivider,
    MatButton,
    MatIcon,
    RouterLink,
    DatePipe
  ],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.scss'
})

export class CourseDetail implements OnInit{
  // Inject the course store to load one single course from the backend API.
  private cs = inject(CourseStore);

  // Inject the booking store to create new bookings.
  private bookingStore = inject(BookingStore);

  // Inject the authentication service to check the current login state and role.
  private authService = inject(Authentication);

  // Inject the current route to read the course ID from the URL.
  private route = inject(ActivatedRoute);

  // Inject the router to navigate after login checks or successful booking.
  private router = inject(Router);

  // to show user feedback messages for booking actions
  private toastr = inject(ToastrService);

  // Read the current course ID from the active route,
  // load the matching course from the backend,
  // and convert the returned Observable into a signal
  // so the course data can be used directly in the template.
  course = toSignal(
    this.route.params.pipe(
      switchMap(({ id }) => this.cs.getSingle(Number(id)))
    ),
    { initialValue: null }
  );

  ngOnInit(): void {
    // Check whether the page was opened with a booking error message.
    const bookingError = this.route.snapshot.queryParamMap.get('bookingError');

    if (bookingError === 'trainer-not-allowed') {
      // Show an error message if a trainer tried to return from login to book a course.
      this.toastr.error('Booking not allowed as a trainer');

      // Remove the temporary booking error parameter from the URL
      // so the error message is shown only once.
      this.router.navigate([], {
        // Stay on the current route.
        relativeTo: this.route,
        // Remove the bookingError query parameter.
        queryParams: { bookingError: null },
        // Keep any other existing query parameters unchanged.
        queryParamsHandling: 'merge',
        // Replace the current browser history entry instead of adding a new one.
        replaceUrl: true
      });
    }
  }

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

  /**
   * Return whether the current user is allowed to book this appointment.
   * - the user must be logged in and a participant
   * - only appointments with status "scheduled" can be booked
   */
  protected canBookAppointment(appointment: Appointment): boolean {
    return this.isParticipant() && appointment.status === 'scheduled';
  }

  /**
   * Create a booking for the selected appointment.
   * - If the user is not logged in, redirect to the login page
   *   and store the current page as return URL.
   * - If the user is a trainer, do not allow booking creation.
   * - After a successful booking, navigate to the bookings page.
   */
  protected bookAppointment(appointmentId: number): void {
    // Redirect unauthenticated users to the login page
    // and remember the current page plus the booking intent
    // as query params
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url,
          bookingIntent: 'true'
        }
      });
      return;
    }

    // Trainers are not allowed to create bookings.
    if (this.isTrainer()) {
      return;
    }

    this.bookingStore.create(appointmentId).subscribe({
      next: () => {
        // Show a success message after a successful booking.
        this.toastr.success('Booking successful');
        // Navigate to the booking overview after a successful booking.
        this.router.navigateByUrl('/bookings');
      },
      error: (error) => {
        console.error('Creating booking failed', error);
        // Read the backend error message if available.
        const backendMessage = error?.error;

        // Show an custom error message
        if (backendMessage === 'booking failed: user already has a booking for this appointment') {
          this.toastr.error(
            'You cannot book this appointment again.',
            'Booking error'
          );
          return;
        }

        // Fallback message for all other booking errors.
        this.toastr.error('Booking error');
      }
    });
  }
}
