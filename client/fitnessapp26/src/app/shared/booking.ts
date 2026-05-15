import { User } from './user';
import { Appointment } from './appointment';

export class Booking {
  constructor(
    public id: number,
    public appointment_id: number,
    public user_id: number,
    public status: string,
    public user: User,
    public appointment?: Appointment
  ) {}
}
