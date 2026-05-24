import { Component, effect, inject, OnInit, signal } from '@angular/core';
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
import { Booking } from '../../../shared/booking';
import { ToastrService } from 'ngx-toastr';
import { AppointmentStore } from '../../../shared/services/appointment-store';

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

  // Inject the appointment store to manage trainer appointments.
  private appointmentStore = inject(AppointmentStore);

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

  // Store which appointment IDs are currently expanded in the UI
  expandedAppointments = signal<number[]>([]);

  // Store the loaded bookings for each appointment.
  // object key is appointment ID, value is the array of bookings for that appointment
  participantBookings = signal<Record<number, Booking[]>>({});

  constructor() {
    effect(() => {
      const course = this.course();

      // Stop if no course data is loaded yet or if the current user
      // is not the trainer of this course
      if (!course || !this.isOwnCourseTrainer() || !course.appointments?.length) {
        return;
      }

      // Preload the bookings for all appointments once so the booking count
      // is already available
      for (const appointment of course.appointments) {
        this.loadParticipantBookings(appointment.id);
      }
    });
  }

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
   * Return whether the logged-in trainer owns the currently displayed course.
   * Only the trainer of this course should see appointment management actions
   */
  protected isOwnCourseTrainer(): boolean {
    const c = this.course();
    const currentUserId = this.authService.getUserId();

    if (!c) {
      return false;
    }

    return this.isTrainer() && currentUserId === c.trainer_id;
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
   * Navigate to the trainer appointment form for creating a new appointment
   */
  protected addAppointment(): void {
    const c = this.course();

    if (!c) {
      return;
    }

    // course ID is passed as query parameter so the form already knows
    // for which course the appointment should be created
    this.router.navigate(['/trainer/appointments/new'], {
      queryParams: { courseId: c.id }
    });
  }

  /**
   * Delete one appointment after user confirmation.
   * Reload the current page after a successful delete.
   */
  protected deleteAppointment(appointmentId: number): void {
    const confirmed = confirm('Do you really want to delete this appointment?');

    if (!confirmed) {
      return;
    }

    this.appointmentStore.delete(appointmentId).subscribe({
      next: () => {
        // Show a short success message after the appointment was deleted.
        this.toastr.success('Appointment deleted successfully.');

        // Reload the current course detail page so the appointment list is refreshed.
        // First navigate away internally and then back to the current course detail route
        // to force the component to reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/courses', this.course()?.id]);
        });
      },
      error: (error) => {
        console.error('Deleting appointment failed', error);
        const backendMessage = error?.error;

        if (backendMessage === 'appointment cannot be deleted because bookings still exist') {
          this.toastr.error('Cannot delete appointment with bookings.', 'Error');
          return;
        }

        if (backendMessage === 'appointment cannot be deleted because it has already started or is in the past') {
          this.toastr.error('Past appointments cannot be deleted.', 'Error');
          return;
        }

        if (backendMessage === 'you are not allowed to delete this appointment') {
          this.toastr.error('You cannot delete this appointment.', 'Error');
          return;
        }

        if (backendMessage === 'only trainers can delete appointments') {
          this.toastr.error('Only trainers can delete appointments.', 'Error');
          return;
        }

        this.toastr.error('Appointment could not be deleted.', 'Error');
      }
    });
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
            'Error'
          );
          return;
        }

        // Fallback message for all other booking errors.
        this.toastr.error('Booking error');
      }
    });
  }

  /**
   * Return all active participant bookings for one appointment.
   * Only bookings with status "booked" are returned
   */
  protected getActiveBookings(appointment: Appointment): Booking[] {
    // Use loaded bookings if available, otherwise fall back to the appointment data or an empty array
    const loadedBookings = this.participantBookings()[appointment.id] ?? appointment.bookings ?? [];

    return loadedBookings.filter((booking) => booking.status === 'booked');
  }

  /**
   * Return the number of active bookings for one appointment
   */
  protected getActiveBookingCount(appointment: Appointment): number {
    return this.getActiveBookings(appointment).length;
  }

  /**
   * Return whether the participant section of one appointment is currently expanded.
   */
  protected isParticipantsExpanded(appointmentId: number): boolean {
    return this.expandedAppointments().includes(appointmentId);
  }

  /**
   * Expand or collapse the participant section of one appointment.
   * Make sure the bookings are loaded before showing the participant names.
   */
  protected toggleParticipants(appointmentId: number): void {
    const expandedIds = this.expandedAppointments();

    // Collapse the section if it is already open
    if (expandedIds.includes(appointmentId)) {
      this.expandedAppointments.set(
        expandedIds.filter((id) => id !== appointmentId)
      );
      return;
    }

    // Ensure the participant bookings are available.
    this.loadParticipantBookings(appointmentId);

    // Expand the selected appointment section.
    this.expandedAppointments.set([...expandedIds, appointmentId]);
  }

  /**
   * Load the participant bookings for one appointment once.
   * Skip the request if the bookings for this appointment were already loaded before.
   */
  private loadParticipantBookings(appointmentId: number): void {
    // Stop if bookings for this appointment are already stored locally.
    if (this.participantBookings()[appointmentId]) {
      return;
    }

    // Load the appointment details for the selected appointment ID
    this.appointmentStore.getSingle(appointmentId).subscribe({
      next: (appointment) => {
        // Update the local participantBookings signal with the newly loaded bookings.
        // currentBookings:  all bookings that were already loaded for other appointments
        // spread operator keeps entries and only adds the bookings for the currently opened appointment
        this.participantBookings.update((currentBookings) => ({
          ...currentBookings,
          [appointmentId]: appointment.bookings ?? []
        }));
      },
      error: (error) => {
        console.error('Loading appointment participants failed', error);
      }
    });
  }
}
