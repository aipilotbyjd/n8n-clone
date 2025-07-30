# 🔒 Security Guide

This guide outlines the security best practices and implementation details for the n8n clone project.

## 🔐 Authentication

### JWT (JSON Web Tokens)
- **Access Tokens**: Short-lived (15 minutes) tokens used to access protected resources.
- **Refresh Tokens**: Long-lived (7 days) tokens used to obtain new access tokens.

### Authentication Flow
1.  User logs in with email and password.
2.  Server returns an access token and a refresh token.
3.  Client stores the tokens securely (e.g., in an HTTP-only cookie).
4.  Client includes the access token in the `Authorization` header for all requests.
5.  If the access token expires, the client uses the refresh token to obtain a new access token.

## 🔑 Authorization

### Role-Based Access Control (RBAC)
- **Roles**: `admin`, `editor`, `viewer`
- **Permissions**: Each role has a set of permissions that define what actions they can perform.

### Permissions
- **Workflows**: `create`, `read`, `update`, `delete`
- **Credentials**: `create`, `read`, `update`, `delete`
- **Users**: `create`, `read`, `update`, `delete`

### Authorization Guard
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

## 🛡️ Data Security

### Encryption at Rest
All sensitive data, such as credentials and user information, is encrypted at rest using AES-256 encryption.

### Encryption in Transit
All communication between the client and server is encrypted using TLS/SSL.

### Secrets Management
- **HashiCorp Vault**: Used for secure storage and management of secrets, such as API keys and database credentials.

## ⚔️ Other Security Measures

### Input Validation
All user input is validated to prevent common security vulnerabilities, such as XSS and SQL injection.

### Rate Limiting
The API implements rate limiting to protect against brute-force attacks and denial-of-service (DoS) attacks.

### Security Headers
- **Helmet**: Used to set various HTTP headers to improve security, such as `Content-Security-Policy`, `Strict-Transport-Security`, and `X-Frame-Options`.

### CORS (Cross-Origin Resource Sharing)
CORS is configured to only allow requests from trusted origins.

---

**Next**: [Performance Optimization](./15-performance.md)

