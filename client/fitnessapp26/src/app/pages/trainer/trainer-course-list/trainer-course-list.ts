import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { Course } from '../../../shared/course';
import { CourseStore } from '../../../shared/services/course-store';
import { Authentication } from '../../../shared/services/authentication';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fa-trainer-course-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCard,
    MatCardContent,
    MatButton
  ],
  templateUrl: './trainer-course-list.html',
  styleUrl: './trainer-course-list.scss'
})
export class TrainerCourseList {
  // Use the course store to load all courses from the backend.
  private courseStore = inject(CourseStore);

  // Use the authentication service to identify the currently logged-in trainer.
  private authService = inject(Authentication);

  // Show short feedback messages after delete actions.
  private toastr = inject(ToastrService);

  // Store only the courses that belong to the current trainer.
  trainerCourses = signal<Course[]>([]);

  constructor() {
    // Load the trainer's courses when the component is created.
    this.loadTrainerCourses();
  }

  /**
   * Load all courses from the backend and keep only the courses
   * that belong to the currently authenticated trainer.
   */
  loadTrainerCourses(): void {
    const currentUserId = this.authService.getUserId();

    // Stop if no logged-in user ID is available.
    if (!currentUserId) {
      this.trainerCourses.set([]);
      return;
    }

    this.courseStore.getAll().subscribe({
      next: (courses) => {
        // Filter the full course list so only the current trainer's courses remain.
        const filteredCourses = courses.filter(
          (course) => course.trainer_id === currentUserId
        );

        // Store the filtered trainer courses in the signal.
        this.trainerCourses.set(filteredCourses);
      },
      error: (error) => {
        console.error('Loading trainer courses failed', error);
      }
    });
  }

  /**
   * Delete one course after user confirmation.
   * Reload the trainer course list after a successful delete.
   */
  protected deleteCourse(courseId: number): void {
    const confirmed = confirm('Do you really want to delete this course?');

    // Stop if the user cancels the confirmation dialog.
    if (!confirmed) {
      return;
    }

    this.courseStore.delete(courseId).subscribe({
      next: () => {
        // Show a short success message after the course was deleted.
        this.toastr.success('Course deleted successfully.');
        // Reload the course list so the deleted course disappears from the UI
        this.loadTrainerCourses();
      },
      error: (error) => {
        console.error('Deleting course failed', error);

        // Read the plain backend error message returned by Laravel.
        const backendMessage = error?.error;

        // Show a specific message depending on the backend reason.
        if (backendMessage === 'course cannot be deleted because appointments still exist') {
          this.toastr.error('Cannot delete course with appointments.', 'Error');
        } else if (backendMessage === 'you are not allowed to delete this course') {
          this.toastr.error('You cannot delete this course.', 'Error');
        } else if (backendMessage === 'only trainers can delete courses') {
          this.toastr.error('Only trainers can delete courses.', 'Error');
        } else {
          this.toastr.error('Course could not be deleted.', 'Error');
        }
      }
    });
  }
}
