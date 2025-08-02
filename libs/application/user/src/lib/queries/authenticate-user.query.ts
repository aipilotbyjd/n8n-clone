export class AuthenticateUserQuery {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}
}
