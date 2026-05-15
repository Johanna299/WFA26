import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CourseStore } from '../../../shared/services/course-store';

@Component({
  selector: 'fa-course-detail',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatDivider,
    MatButton,
    MatIcon,
    RouterLink
  ],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.scss'
})

export class CourseDetail {
  // Inject the course store to load one single course from the backend API.
  private cs = inject(CourseStore);

  // Inject the current route to read the course ID from the URL.
  private route = inject(ActivatedRoute);

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
}
