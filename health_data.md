# Health Data Protection Ideas

This note lists practical steps to harden health data handling beyond basic
database encryption.

- Encrypt sensitive fields at rest with envelope encryption (per-tenant data keys).
- Rotate encryption keys on a schedule and support re-encryption with versioned payloads.
- Store personal information separately from sensitive health data and limit access.
- Add audit logs for read/write access to health data, including admin access.
- Enforce strict RBAC for all admin tools (read, export, delete).
- Implement least-privilege service accounts and limit DB access by IP/VPC.
- Enable field-level encryption in the database where supported.
- Use separate collections for sensitive data with tighter access rules.
- Hash or tokenize identifiers in analytics/telemetry pipelines.
- Add server-side validation to reject unexpected fields and oversized payloads.
- Enable rate limiting on health data endpoints to reduce abuse.
- Provide secure export/delete flows for user data (compliance readiness).
