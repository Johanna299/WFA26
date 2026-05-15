import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CourseStore } from '../../../shared/services/course-store';

@Component({
  selector: 'fa-course-list',
  standalone: true,
  imports: [
    MatCardModule,
    RouterLink
  ],
  templateUrl: './course-list.html',
  styleUrl: './course-list.scss'
})
export class CourseList {
  // Inject the course store service to load courses from the backend API.
  private service = inject(CourseStore);

  // Convert the Observable returned by the service into a signal
  // so the course list can be used directly in the template.
  courses = toSignal(this.service.getAll(), { initialValue: [] });
}
