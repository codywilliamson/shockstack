# Auth

Authentication is session-based and designed for secure defaults with low frontend complexity.

## What It Handles

- Email/password sign-up and sign-in
- Session creation and rotation
- Cookie-backed session persistence
- Route protection for authenticated areas

## Session Flow

1. User submits credentials
2. Auth layer validates credentials and creates a session
3. Session token is stored in secure, httpOnly cookies
4. Middleware resolves session on each request and attaches user context
5. Protected routes redirect to sign-in when no valid session exists

## Data Model

Core records include:

- users
- sessions
- linked accounts
- verification records

## Security Notes

- Session cookies are not readable from client-side JavaScript
- Protected routes rely on server-side checks, not just client state
- Auth failures degrade gracefully to unauthenticated behavior
