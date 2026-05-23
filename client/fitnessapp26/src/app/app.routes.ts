import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CourseList } from './pages/courses/course-list/course-list';
import { CourseDetail } from './pages/courses/course-detail/course-detail';
import { Login } from './pages/login/login';
import { BookingList } from './pages/bookings/booking-list/booking-list';
import { TrainerCourseList } from './pages/trainer/trainer-course-list/trainer-course-list';
import { TrainerCourseForm } from './pages/trainer/trainer-course-form/trainer-course-form';
import { TrainerAppointmentForm } from './pages/trainer/trainer-appointment-form/trainer-appointment-form';

export const routes: Routes = [
  // Redirect the root URL to the home page.
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Public start page of the application.
  { path: 'home', component: Home },

  // Public page that shows all available courses.
  { path: 'courses', component: CourseList },

  // Public detail page for one selected course.
  // The route parameter ":id" contains the ID of the course.
  { path: 'courses/:id', component: CourseDetail },

  // Login page for trainers and participants.
  { path: 'login', component: Login },

  // Page that shows the bookings of the currently logged-in participant.
  { path: 'bookings', component: BookingList },

  // Trainer page that shows all courses of the currently logged-in trainer.
  { path: 'trainer/courses', component: TrainerCourseList },

  // Trainer page for creating a new course.
  { path: 'trainer/courses/new', component: TrainerCourseForm },

  // Trainer page for editing an existing course.
  // The route parameter ":id" contains the ID of the course to edit.
  { path: 'trainer/courses/:id/edit', component: TrainerCourseForm },

  // Trainer page for creating a new appointment.
  { path: 'trainer/appointments/new', component: TrainerAppointmentForm },

  // Trainer page for editing an existing appointment.
  // The route parameter ":id" contains the ID of the appointment to edit.
  { path: 'trainer/appointments/:id/edit', component: TrainerAppointmentForm },

  // Fallback route: redirect unknown URLs to the home page.
  { path: '**', redirectTo: 'home' }
];
