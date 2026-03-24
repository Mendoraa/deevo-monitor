# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Email:** [bader.marketing.39@gmail.com](mailto:bader.marketing.39@gmail.com)

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and aim to provide a resolution timeline within 5 business days.

**Do not** open a public GitHub issue for security vulnerabilities.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 3.x (current) | Yes |
| < 3.0 | No |

## Security Practices

### Secrets Management
- Environment variables are used for all sensitive configuration
- `.env` files are excluded from version control via `.gitignore`
- `.env.example` files contain only placeholder values
- Docker Compose uses environment variable references for production

### Data Handling
- All API inputs are validated through Pydantic schemas
- Database queries use parameterized statements via SQLAlchemy ORM
- CORS is configured with explicit origin allowlists

### Audit Trail
- The system includes SHA-256 audit event logging
- All scoring and calibration actions are recorded with timestamps
- Prediction-to-outcome feedback loops are traceable

### Dependencies
- Pin all dependency versions in `requirements.txt` and `package.json`
- Review dependency updates before merging
- Monitor for known vulnerabilities in upstream packages

## Scope

This security policy applies to the code in this repository. Third-party services, hosting platforms, and infrastructure are outside this scope.
