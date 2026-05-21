import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { CourseStore } from '../../../shared/services/course-store';
import { CategoryStore } from '../../../shared/services/category-store';
import { DifficultyStore } from '../../../shared/services/difficulty-store';
import { Course } from '../../../shared/course';
import { Category } from '../../../shared/category';
import { Difficulty } from '../../../shared/difficulty';
import { CourseValidators } from '../../../shared/course-validators';
import { TrainerCourseFormErrorMessages } from './trainer-course-form-error-messages';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fa-trainer-course-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCard,
    MatCardContent,
    MatCardTitle
  ],
  templateUrl: './trainer-course-form.html',
  styleUrl: './trainer-course-form.scss',
  standalone: true
})
export class TrainerCourseForm {
  // Build and manage the reactive form structure.
  private fb = inject(FormBuilder);

  // Read route parameters to detect whether the form is used
  // for creating a new course or editing an existing one.
  private route = inject(ActivatedRoute);

  // Navigate after a successful create or update request.
  private router = inject(Router);

  // Show short success messages after saving course
  private toastr = inject(ToastrService);

  // Use dedicated services to load and save backend data.
  private courseStore = inject(CourseStore);
  private categoryStore = inject(CategoryStore);
  private difficultyStore = inject(DifficultyStore);

  // Store the currently loaded course in edit mode.
  // In create mode, this stays null.
  course = signal<Course | null>(null);

  // Store whether the form is currently used to update an existing course.
  // false = create mode, true = edit mode
  isUpdatingCourse = signal(false);

  // Store all available categories for the checkbox list.
  categories = signal<Category[]>([]);

  // Store all available difficulty levels for the select field.
  difficulties = signal<Difficulty[]>([]);

  // Store visible validation messages for the template.
  // The key is the form control name, for example "title" or "location".
  errors: { [key: string]: string } = {};

  // Build the reactive form for both create and edit mode.
  // category_ids uses a custom validator because an empty array
  // should be invalid if no category is selected.
  courseForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    location: ['', [Validators.required, Validators.maxLength(255)]],
    participant_limit: [1, [Validators.required, Validators.min(1)]],
    difficulty_id: [null as number | null, Validators.required],
    category_ids: this.fb.control<number[]>([], CourseValidators.minArrayLength(1))
  });

  constructor() {
    // For edit mode: React whenever the loaded course signal changes.
    effect(() => {
      const c = this.course();

      // Stop if no course is loaded yet or if the form is not in edit mode.
      if (!c || !this.isUpdatingCourse()) {
        return;
      }

      // Fill the form with the existing course data.
      // This allows the trainer to edit the current values.
      this.courseForm.patchValue({
        title: c.title,
        description: c.description ?? '',
        location: c.location,
        participant_limit: c.participant_limit,
        difficulty_id: c.difficulty_id,
        category_ids: c.categories.map(category => category.id)
      });

      // Recalculate error messages after patching values.
      this.updateErrorMessages();
    });

    // Recalculate visible validation messages whenever the form status changes.
    this.courseForm.statusChanges.subscribe(() => {
      this.updateErrorMessages();
    });

    // Recalculate visible validation messages whenever form values change.
    this.courseForm.valueChanges.subscribe(() => {
      this.updateErrorMessages();
    });
  }

  ngOnInit(): void {
    // Read the optional course ID from the current route
    const id = this.route.snapshot.params['id'];

    // If the route contains an ID, the form is used to edit an existing course.
    if (id) {
      this.isUpdatingCourse.set(true);
    }

    // Edit mode: load the data needed
    if (this.isUpdatingCourse()) {
      // forkJoin: RxJS function to collect all data together
      // before moving on with the results
      forkJoin({
        categories: this.categoryStore.getAll(),
        difficulties: this.difficultyStore.getAll(),
        course: this.courseStore.getSingle(Number(id))
      }).subscribe({
        next: (result) => {
          // Store the loaded data in signals so the template can use it
          this.categories.set(result.categories);
          this.difficulties.set(result.difficulties);
          this.course.set(result.course);
        },
        error: (error) => {
          console.error('Loading course form data failed', error);
        }
      });
    } else {
      // Create mode: only categories and difficulties are needed
      forkJoin({
        categories: this.categoryStore.getAll(),
        difficulties: this.difficultyStore.getAll()
      }).subscribe({
        next: (result) => {
          this.categories.set(result.categories);
          this.difficulties.set(result.difficulties);
        },
        error: (error) => {
          console.error('Loading course form data failed', error);
        }
      });
    }
  }

  /**
   * Return the page title depending on the current form mode.
   */
  protected getFormTitle(): string {
    return this.isUpdatingCourse() ? 'Edit Course' : 'Create Course';
  }

  /**
   * Return the submit button label depending on the current form mode.
   */
  protected getSubmitLabel(): string {
    return this.isUpdatingCourse() ? 'Save Changes' : 'Create Course';
  }

  /**
   * Mark one form field as touched and immediately recalculate
   * the visible validation messages.
   */
  protected markFieldAsTouched(controlName: string): void {
    // Read one specific control from the reactive form
    const control = this.courseForm.get(controlName);

    // Stop if the control name does not exist in the form
    if (!control) {
      return;
    }

    // Mark the control as touched so validation messages can be shown
    control.markAsTouched();
    // Recalculate the error message object immediately
    // so the template can display the matching validation text
    this.updateErrorMessages();
  }

  /**
   * Check whether one category is currently selected in the form.
   * This is used to control the checkbox state in the template.
   */
  protected isCategorySelected(categoryId: number): boolean {
    const selectedCategoryIds = this.courseForm.get('category_ids')?.value ?? [];
    return selectedCategoryIds.includes(categoryId);
  }

  /**
   * Add or remove one category ID when a category checkbox changes.
   * The form stores selected categories as an array of numeric IDs.
   */
  protected toggleCategory(categoryId: number, checked: boolean): void {
    // Read currently selected category IDs from the form
    // and create a copy so the original array is not modified directly.
    let selectedCategoryIds = [...(this.courseForm.get('category_ids')?.value ?? [])];

    if (checked) {
      // Add the category ID only if it is not already selected.
      if (!selectedCategoryIds.includes(categoryId)) {
        selectedCategoryIds.push(categoryId);
      }
    } else {
      // Remove the category ID if the checkbox was unchecked.
      selectedCategoryIds = selectedCategoryIds.filter(id => id !== categoryId);
    }

    // Write the updated category ID array back into the form.
    this.courseForm.patchValue({ category_ids: selectedCategoryIds });

    // Read the category control once so it can be reused below.
    const categoryControl = this.courseForm.get('category_ids');
    // Mark the control as changed and touched so validation messages
    // can be shown immediately after the checkbox interaction.
    categoryControl?.markAsDirty();
    categoryControl?.markAsTouched();
    // Recalculate the validation state of the control,
    // for example for the custom minArrayLength validator.
    categoryControl?.updateValueAndValidity();
    // Rebuild the error messages for the template
    this.updateErrorMessages();
  }

  /**
   * Submit the form.
   * Create mode: create a new course.
   * Edit mode: update the existing course.
   */
  protected submitForm(): void {
    // If the form is invalid, show validation messages and stop.
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      this.updateErrorMessages();
      return;
    }

    // Read all current form values.
    const raw = this.courseForm.getRawValue();

    // Build the payload in the exact structure expected by the backend.
    const courseData = {
      title: raw.title ?? '',
      description: raw.description || null,
      location: raw.location ?? '',
      participant_limit: Number(raw.participant_limit),
      difficulty_id: Number(raw.difficulty_id),
      category_ids: raw.category_ids ?? []
    };

    // Update an existing course if the form is in edit mode.
    if (this.isUpdatingCourse() && this.course()) {
      this.courseStore.update(this.course()!.id, courseData).subscribe({
        next: (updatedCourse) => {
          // Show a short success message after the course was updated
          this.toastr.success('Course updated successfully.');

          // Navigate to the public course detail page after a successful update.
          this.router.navigate(['/courses', updatedCourse.id]);
        },
        error: (error) => {
          console.error('Updating course failed', error);
          // Show a short error message if updating the course failed.
          this.toastr.error('Updating the course failed.', 'Error');
        }
      });
    } else {
      // Otherwise create a completely new course.
      this.courseStore.create(courseData).subscribe({
        next: (createdCourse) => {
          // Show a short success message after the course was created.
          this.toastr.success('Course created successfully.');
          // Navigate to the public course detail page after a successful creation.
          this.router.navigate(['/courses', createdCourse.id]);
        },
        error: (error) => {
          console.error('Creating course failed', error);
          // Show a short error message if creating the course failed
          this.toastr.error('Creating the course failed.', 'Error');
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
    for (const message of TrainerCourseFormErrorMessages) {
      // Read the matching form control
      const control = this.courseForm.get(message.forControl);

      if (
        // control exists
        control &&
        // control is invalid
        control.invalid &&
        // user has already interacted with the field
        (control.dirty || control.touched) &&
        // current validator error matches this message definition
        control.errors?.[message.forValidator] &&
        // and no other message has been stored for this field yet
        !this.errors[message.forControl]
      ) {
        // Store error message text for the template.
        this.errors[message.forControl] = message.text;
      }
    }
  }
}
