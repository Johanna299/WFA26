import { AbstractControl, ValidationErrors } from '@angular/forms';

export class AppointmentValidators {
  /**
   * Validate that the selected appointment date and time is in the future.
   */
  static startsAtInFuture(control: AbstractControl): ValidationErrors | null {
    // Stop if no value exists yet
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const now = new Date();

    return selectedDate > now ? null : { startsAtInFuture: true };
  }
}
