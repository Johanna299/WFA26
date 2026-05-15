import { User } from './user';
import { Difficulty } from './difficulty';
import { Category } from './category';
import { Appointment } from './appointment';

export class Course {
  constructor(
    public id: number,
    public title: string,
    public description: string | null,
    public location: string,
    public participant_limit: number,
    public difficulty_id: number,
    public trainer_id: number,
    public trainer: User,
    public difficulty: Difficulty,
    public categories: Category[],
    public appointments?: Appointment[]
  ) {}
}
