# Email Troubleshooting Guide

## Understanding SMTP Error Categories

Our enhanced email service now provides detailed error categorization to help you troubleshoot email delivery issues more effectively. Here's what each error category means:

### Hard Bounce Categories (Permanent Failures)

- **invalid_recipient**: The recipient's email address does not exist or is no longer active.
  - Example: "550 Requested action not taken: mailbox unavailable"
  - Resolution: Remove this email from your recipient list.

- **spam_block**: The email was blocked due to spam-related issues.
  - Example: "550 Message rejected due to spam content"
  - Resolution: Review your email content and sender reputation.

- **content_violation**: The email content violates the recipient server's policy.
  - Example: "550 Email rejected due to security policy"
  - Resolution: Review and modify email content, attachments, or links.

- **message_size_exceeded**: The email is too large for the recipient server.
  - Example: "552 Requested mail action aborted: exceeded storage allocation"
  - Resolution: Reduce email size, optimize images, or use links instead of attachments.

- **invalid_address_syntax**: The email address format is incorrect.
  - Example: "553 Sender address refused"
  - Resolution: Verify and correct the email address format.

- **authentication_error**: Authentication with the SMTP server failed.
  - Example: "535 Authentication failed: Bad username or password"
  - Resolution: Verify SMTP credentials, check if app password is required.

### Soft Bounce Categories (Temporary Failures)

- **service_unavailable**: The recipient server is temporarily unavailable.
  - Example: "421 Service not available, closing transmission channel"
  - Resolution: Retry sending later.

- **mailbox_busy**: The recipient's mailbox is temporarily unavailable.
  - Example: "450 Requested mail action not taken: mailbox unavailable"
  - Resolution: Retry sending later.

- **mailbox_full**: The recipient's mailbox is full.
  - Example: "422 The user's mailbox is full"
  - Resolution: Wait and retry later, or try to contact the recipient through another channel.

- **connection_timeout**: The connection to the SMTP server timed out.
  - Example: "421 Connection timed out"
  - Resolution: Check network connectivity and retry later.

## Other Issues

- **connection_error**: Failed to establish a connection with the SMTP server.
  - Resolution: Check network connectivity, firewall settings, or server availability.

- **timeout**: Operation timed out (could be connection, sending, or other operation).
  - Resolution: Check network speed and retry with smaller batches.

## Analyzing Email Logs

The system now captures detailed SMTP session logs and responses. When troubleshooting:

1. **Check the `smtp_error_code`**: Numeric error codes provide specific information about what went wrong.
2. **Review the `smtp_response`**: The full response from the SMTP server often contains valuable details.
3. **Examine the `smtp_session_log`**: This shows the complete SMTP conversation, useful for advanced troubleshooting.
4. **Look at the `delivery_category`**: This helps you understand the general type of issue.
5. **Consider the `delivery_status`**: This tells you if it's a permanent failure (hard bounce) or temporary (soft bounce).

## Best Practices for Maintaining Deliverability

1. Regularly clean your email lists by removing invalid addresses
2. Monitor bounce rates closely - high rates can damage sender reputation
3. Implement proper warm-up protocols for new email accounts
4. Rotate through multiple sending accounts to distribute sending load
5. Set appropriate retry strategies for soft bounces
6. Use TLS encryption whenever possible
7. Authenticate your domains with SPF, DKIM, and DMARC
8. Avoid spam-triggering content and practices

## Using the Enhanced Logging for Troubleshooting

```python
# Sample code to check detailed email logs for troubleshooting
from app.models.email_log import EmailLog
from app.extensions import db

# Query for failed emails
failed_emails = EmailLog.query.filter(
    EmailLog.status == 'error'
).order_by(EmailLog.created_at.desc()).limit(10).all()

# Analyze failures by category
for log in failed_emails:
    print(f"Email to: {log.recipient.email if log.recipient else 'Unknown'}")
    print(f"Status: {log.status}")
    print(f"Error code: {log.smtp_error_code}")
    print(f"Error category: {log.delivery_category}")
    print(f"Error message: {log.error_message}")
    print(f"SMTP response: {log.smtp_response}")
    print("---")
    
    # Recommended action based on error category
    if log.delivery_category == 'invalid_recipient':
        print("Action: Remove this recipient from your lists\n")
    elif log.delivery_category == 'authentication_error':
        print("Action: Check SMTP credentials and server settings\n")
    elif log.delivery_category in ['service_unavailable', 'mailbox_busy', 'connection_timeout']:
        print("Action: Retry sending later\n")
    # ... and so on for other categories
```

This guide should help you effectively utilize the enhanced email logging and error handling capabilities to improve email deliverability and troubleshoot issues more effectively.