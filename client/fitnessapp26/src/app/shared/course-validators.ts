import { AbstractControl, ValidatorFn } from '@angular/forms';

export class CourseValidators {
  /**
   * Create a custom validator for array-based form fields.
   * The validator checks whether the array contains
   * at least the required number of selected items.
   */
  static minArrayLength(min: number): ValidatorFn {
    // Return the actual validator function that Angular will run
    // for the current form control.
    return (control: AbstractControl) => {
      // Read the current array length.
      // If the control value is null or undefined, use 0 as fallback.
      const currentLength = control.value?.length ?? 0;

      // Return null if the control is valid.
      // Otherwise return a validation error object with the key "minArrayLength".
      return currentLength >= min
        ? null
        : { minArrayLength: true };
    };
  }
}
