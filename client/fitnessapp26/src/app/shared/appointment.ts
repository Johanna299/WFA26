import { Course } from './course';
import { Booking } from './booking';

export class Appointment {
  constructor(
    public id: number,
    public course_id: number,
    public starts_at: string,
    public duration: number,
    public status: string,
    public course?: Course,
    public bookings?: Booking[]
  ) {}
}
