export class User {
  constructor(
    public id: number,
    public firstname: string,
    public lastname: string,
    public email: string,
    public is_trainer: boolean,
    public info?: string | null,
    public phone?: string | null
  ) {}
}
