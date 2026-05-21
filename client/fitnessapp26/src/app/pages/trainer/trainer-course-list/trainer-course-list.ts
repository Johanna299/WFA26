import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { Course } from '../../../shared/course';
import { CourseStore } from '../../../shared/services/course-store';
import { Authentication } from '../../../shared/services/authentication';

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
}
