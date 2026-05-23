/**
 * Store one user-friendly validation message
 * for one specific form control and validator.
 */
export class ErrorMessage {
  constructor(
    public forControl: string,
    public forValidator: string,
    public text: string
  ) {}
}

export const TrainerAppointmentFormErrorMessages = [
  new ErrorMessage('starts_at', 'required', 'A start date and time is required.'),
  new ErrorMessage('starts_at', 'startsAtInFuture', 'The appointment must be in the future.'),
  new ErrorMessage('duration', 'required', 'A duration is required.'),
  new ErrorMessage('duration', 'min', 'The duration must be at least 1 minute.'),
  new ErrorMessage('status', 'required', 'A status is required.')
];
