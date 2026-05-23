import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AppointmentStore } from '../../../shared/services/appointment-store';
import { Appointment } from '../../../shared/appointment';
import { ToastrService } from 'ngx-toastr';
import { AppointmentValidators } from '../../../shared/appointment-validators';
import { TrainerAppointmentFormErrorMessages } from './trainer-appointment-form-error-messages';

@Component({
  selector: 'fa-trainer-appointment-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatButton,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './trainer-appointment-form.html',
  styleUrl: './trainer-appointment-form.scss',
})
export class TrainerAppointmentForm {
  // Build and manage the reactive form structure
  private fb = inject(FormBuilder);

  // Read route and query parameters to decide whether the form
  // is used for creating or editing an appointment
  private route = inject(ActivatedRoute);

  // Navigate after a successful create or update request
  private router = inject(Router);

  // Use the appointment store to load and save appointment data.
  private appointmentStore = inject(AppointmentStore);

  // Show short feedback messages after save actions
  private toastr = inject(ToastrService);

  // Store the currently loaded appointment in edit mode
  appointment = signal<Appointment | null>(null);

  // Store whether the form is currently used to update an existing appointment.
  isUpdatingAppointment = signal(false);

  // Store the course ID for which the appointment belongs.
  // Create mode: ID comes from the query parameter
  // Edit mode: ID comes from the loaded appointment
  courseId = signal<number | null>(null);

  // Store the currently visible validation messages for the template
  errors: { [key: string]: string } = {};

  // Build the reactive form for both create and edit mode.
  appointmentForm = this.fb.group({
    starts_at: ['', Validators.required],
    duration: [1, [Validators.required, Validators.min(1)]],
    status: ['scheduled', Validators.required]
  });

  constructor() {
    // Reactive side effect that automatically re-runs whenever
    // a tracked signal (for example this.appointment()) changes
    effect(() => {
      const appointment = this.appointment();

      // Stop if no appointment is loaded yet or if the form is not in edit mode
      if (!appointment || !this.isUpdatingAppointment()) {
        return;
      }

      // Edit mode: fill the form with the existing appointment data
      this.appointmentForm.patchValue({
        starts_at: this.formatDateTimeLocal(appointment.starts_at),
        duration: appointment.duration,
        status: appointment.status
      });

      // Store the related course ID so we can navigate back after saving
      this.courseId.set(appointment.course_id);

      // Disable date and duration fields for past appointments,
      // so only the status can be changed
      if (this.isPastAppointment()) {
        this.appointmentForm.get('starts_at')?.disable();
        this.appointmentForm.get('duration')?.disable();
      } else {
        // Keep the fields editable for future appointments
        this.appointmentForm.get('starts_at')?.enable();
        this.appointmentForm.get('duration')?.enable();
      }
    });

    // Rebuild the visible validation messages whenever the form status changes
    this.appointmentForm.statusChanges.subscribe(() => {
      this.updateErrorMessages();
    });
  }

  ngOnInit(): void {
    // Read the optional appointment ID from the current route.
    // ID exists only when the form is opened in edit mode
    const id = this.route.snapshot.params['id'];

    // Edit mode
    if (id) {
      this.isUpdatingAppointment.set(true);

      // Load the existing appointment from the backend
      this.appointmentStore.getSingle(Number(id)).subscribe({
        next: (appointment) => {
          this.appointment.set(appointment);
        },
        error: (error) => {
          console.error('Loading appointment failed', error);
          this.toastr.error('Appointment could not be loaded.', 'Error');
        }
      });
    }
    // Create mode
    else {
      // Read the course ID from the query parameters
      const courseId = this.route.snapshot.queryParamMap.get('courseId');

      if (courseId) {
        this.courseId.set(Number(courseId));
      }

      // Add the future-date validator in create mode only
      this.appointmentForm.get('starts_at')?.addValidators(AppointmentValidators.startsAtInFuture);
      // Revalidate the control immediately so Angular updates its errors and valid/invalid state
      this.appointmentForm.get('starts_at')?.updateValueAndValidity();
    }
  }

  /**
   * Return the page title depending on the current form mode.
   */
  protected getFormTitle(): string {
    return this.isUpdatingAppointment() ? 'Edit Appointment' : 'Create Appointment';
  }

  /**
   * Return the submit button label depending on the current form mode.
   */
  protected getSubmitLabel(): string {
    return this.isUpdatingAppointment() ? 'Save Changes' : 'Create Appointment';
  }

  /**
   * Return the route back to the related course detail page
   */
  protected getCancelLink(): any[] {
    const courseId = this.courseId();

    if (!courseId) {
      return ['/trainer/courses'];
    }

    return ['/courses', courseId];
  }

  /**
   * Return true if the loaded appointment has already started
   * or is already in the past.
   */
  protected isPastAppointment(): boolean {
    const appointment = this.appointment();

    if (!appointment) {
      return false;
    }

    return new Date(appointment.starts_at).getTime() <= Date.now();
  }

  /**
   * Mark one form field as touched and immediately recalculate
   * the visible validation messages
   */
  protected markFieldAsTouched(controlName: string): void {
    // Read one specific control from the reactive form by its control name.
    const control = this.appointmentForm.get(controlName);

    // Stop if the requested control does not exist
    if (!control) {
      return;
    }

    // Mark the control as touched so validation messages
    // can be shown after the user leaves the field
    control.markAsTouched();

    // Rebuild the visible validation messages immediately
    this.updateErrorMessages();
  }

  /**
   * Submit the form.
   * Create mode: create a new appointment.
   * Edit mode: update the existing appointment.
   */
  protected submitForm(): void {
    // Stop if the form is invalid
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      this.updateErrorMessages();
      return;
    }

    const raw = this.appointmentForm.getRawValue();
    const currentCourseId = this.courseId();

    // Stop if no course ID is available.
    // This is required for both create and navigation after update.
    if (!currentCourseId) {
      this.toastr.error('Missing course reference.', 'Error');
      return;
    }

    // Build the payload expected by the backend.
    const appointmentData = {
      course_id: currentCourseId,
      starts_at: raw.starts_at ?? '',
      duration: Number(raw.duration),
      status: raw.status ?? 'scheduled'
    };

    // Edit mode: update an existing appointment
    if (this.isUpdatingAppointment() && this.appointment()) {
      // Past appointments: only send the status
      // Future appointments: may still update all editable fields
      const updateData = this.isPastAppointment()
        ? {
          status: appointmentData.status
        }
        : {
          starts_at: appointmentData.starts_at,
          duration: appointmentData.duration,
          status: appointmentData.status
        };

      this.appointmentStore.update(this.appointment()!.id, updateData).subscribe({
        next: () => {
          // Show a short success message after the appointment was updated
          this.toastr.success('Appointment updated successfully.');

          // Navigate back to the related course detail page.
          this.router.navigate(['/courses', currentCourseId]);
        },
        error: (error) => {
          console.error('Updating appointment failed', error);
          const backendMessage = error?.error;

          if (backendMessage === 'past appointments can only be updated in their status') {
            this.toastr.error('Only the status can be changed for past appointments.', 'Error');
            return;
          }

          if (backendMessage === 'appointment cannot be updated to a past date or time') {
            this.toastr.error('The appointment must be in the future.', 'Error');
            return;
          }

          if (backendMessage === 'you are not allowed to update this appointment') {
            this.toastr.error('You cannot edit this appointment.', 'Error');
            return;
          }

          if (backendMessage === 'only trainers can update appointments') {
            this.toastr.error('Only trainers can edit appointments.', 'Error');
            return;
          }

          this.toastr.error('Appointment could not be updated.', 'Error');
        }
      });
    }
    // Create mode: create a completely new appointment
    else {
      this.appointmentStore.create({
        course_id: appointmentData.course_id,
        starts_at: appointmentData.starts_at,
        duration: appointmentData.duration
      }).subscribe({
        next: () => {
          // Show a short success message after the appointment was created
          this.toastr.success('Appointment created successfully.');

          // Navigate back to the related course detail page.
          this.router.navigate(['/courses', currentCourseId]);
        },
        error: (error) => {
          console.error('Creating appointment failed', error);
          const backendMessage = error?.error;

          if (backendMessage === 'you are not allowed to create appointments for this course') {
            this.toastr.error('You cannot add appointments to this course.', 'Error');
            return;
          }

          if (backendMessage === 'only trainers can create appointments') {
            this.toastr.error('Only trainers can create appointments.', 'Error');
            return;
          }

          this.toastr.error('Appointment could not be created.', 'Error');
        }
      });
    }
  }

  /**
   * Rebuild the visible validation messages for the form.
   * At most one message is shown per form field.
   */
  private updateErrorMessages(): void {
    // Clear previously stored error messages
    this.errors = {};

    // Check every configured validation message definition.
    for (const message of TrainerAppointmentFormErrorMessages) {
      // Read the form control that belongs to the current error message definition.
      const control = this.appointmentForm.get(message.forControl);

      if (
        // Continue only if the control exists
        control &&
        // control is currently invalid
        control.invalid &&
        // user has already interacted with the field
        (control.dirty || control.touched) &&
        // the current validator error matches this message definition
        control.errors?.[message.forValidator] &&
        // no other message has been stored for this field yet
        !this.errors[message.forControl]
      ) {
        // Store the error message text for the template
        this.errors[message.forControl] = message.text;
      }
    }
  }

  /**
   * Convert an ISO datetime string into the format required
   * by an input field of type datetime-local.
   */
  private formatDateTimeLocal(value: string): string {
    const date = new Date(value);
    const year = date.getFullYear();
    // Add 1 because getMonth() starts with 0
    // padStart to add a 0 if there's only 1 digit
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
