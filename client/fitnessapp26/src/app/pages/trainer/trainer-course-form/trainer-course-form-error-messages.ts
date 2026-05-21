// Represent one validation error message for a specific form control and validator
export class ErrorMessage {
  constructor(
    public forControl: string,
    public forValidator: string,
    public text: string
  ) {}
}

export const TrainerCourseFormErrorMessages = [
  new ErrorMessage('title', 'required', 'A course title is required.'),
  new ErrorMessage('location', 'required', 'A location is required.'),
  new ErrorMessage('participant_limit', 'required', 'A participant limit is required.'),
  new ErrorMessage('participant_limit', 'min', 'The participant limit must be at least 1.'),
  new ErrorMessage('difficulty_id', 'required', 'Please select a difficulty level.'),
  new ErrorMessage('category_ids', 'minArrayLength', 'Please select at least one category.')
];
