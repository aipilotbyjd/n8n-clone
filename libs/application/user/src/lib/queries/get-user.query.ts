export class GetUserQuery {
  constructor(
    public readonly userId?: string,
    public readonly email?: string
  ) {}
}
