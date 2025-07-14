# SendGrid Transactional Email System

A Node.js + Express backend for sending transactional emails using SendGrid. This system provides a clean API for handling user registration, password resets, email verification, and other transactional email needs.

## Features

- **SendGrid Integration**: Uses the official @sendgrid/mail library
- **Professional HTML Emails**: Beautiful, responsive email templates
- **Token Management**: Secure token generation and validation
- **Error Handling**: Comprehensive error logging and reporting
- **Environment Configuration**: Secure credential management
- **RESTful API**: Clean, documented API endpoints

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @sendgrid/mail express dotenv
npm install -g nodemon  # Optional, for development
```

### 2. Environment Configuration

Create a `.env` file in your project root:

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=no-reply@system.xtendcreator.com
PORT=3000
NODE_ENV=development
```

### 3. SendGrid Setup

1. Create a SendGrid account at https://sendgrid.com
2. Generate an API key in your SendGrid dashboard
3. Verify your sender email domain
4. Add the API key to your `.env` file

### 4. Run the Application

```bash
# Start the server
node transactional-server.js

# Or for development with auto-reload
nodemon transactional-server.js

# Test the SendGrid connection
node test-transactional.js
```

## API Endpoints

### POST /api/register
Sends a welcome email to new users.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "username": "johndoe"
}
```

**Response:**
```json
{
  "message": "User registered successfully and welcome email sent",
  "email": "user@example.com"
}
```

### POST /api/forgot-password
Sends a password reset email with a secure token.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent successfully",
  "token": "generated_reset_token"
}
```

### POST /api/password-reset-success
Sends a confirmation email after password change.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST /api/send-verification
Sends an email verification link.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Verification email sent successfully",
  "token": "verification_token"
}
```

### GET /api/verify-email?token=TOKEN
Verifies an email using the provided token.

**Response:**
```json
{
  "message": "Email verified successfully!",
  "email": "user@example.com",
  "verified": true
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "service": "Transactional Email Service",
  "timestamp": "2025-05-29T16:00:00.000Z"
}
```

## Email Templates

All emails use professional HTML formatting with:
- Responsive design
- Brand colors (#00a99d)
- Clear call-to-action buttons
- Professional typography
- Security warnings where appropriate

## Testing

Use the provided test script to verify your SendGrid integration:

```bash
node test-transactional.js
```

This will:
- Check environment variables
- Test the SendGrid connection
- Send a test email
- Display API usage examples

## cURL Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe","username":"johndoe"}'
```

### Request Password Reset
```bash
curl -X POST http://localhost:3000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Send Verification Email
```bash
curl -X POST http://localhost:3000/api/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

## File Structure

```
.
├── transactional-server.js    # Main Express server
├── email.js                   # SendGrid email utility
├── test-transactional.js      # Testing script
├── .env.example              # Environment template
├── transactional-package.json # Package configuration
└── README-transactional.md   # This documentation
```

## Security Features

- **Token Expiration**: All tokens have time-based expiration
- **Secure Token Generation**: Cryptographically secure random tokens
- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: Request body validation
- **Error Handling**: Proper error responses without exposing internals

## Production Considerations

1. **Database Integration**: Replace in-memory token storage with a database
2. **Rate Limiting**: Implement rate limiting for email endpoints
3. **Logging**: Add structured logging for monitoring
4. **HTTPS**: Use HTTPS in production
5. **CORS**: Configure CORS for your frontend domain

## Troubleshooting

### Common Issues

1. **SendGrid API Key Invalid**: Verify your API key in SendGrid dashboard
2. **Email Not Delivered**: Check SendGrid activity feed for delivery status
3. **Token Expired**: Tokens expire (1 hour for password reset, 24 hours for verification)
4. **From Email Not Verified**: Verify your sender domain in SendGrid

### Debug Mode

Enable detailed logging by setting `NODE_ENV=development` in your `.env` file.

## License

MIT License - Feel free to use this in your projects.