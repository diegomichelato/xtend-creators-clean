# Email Deliverability Tools

This document explains the email deliverability tools that have been added to the system to help monitor and improve email sending performance.

## 1. Enhanced Error Tracking

We've significantly improved the SMTP error handling and tracking capabilities in the email sending system. The system now captures detailed information about:

- SMTP error codes (e.g., 550, 421, 535)
- Full SMTP server responses
- Detailed SMTP session logs
- Error categories (e.g., invalid_recipient, authentication_error, spam_block)
- Delivery status classifications (hard_bounce, soft_bounce, deferred)

This information is stored in the `EmailLog` model and can be used for troubleshooting and analysis.

## 2. Email Health Dashboard

A new dashboard has been added to visualize email account health and deliverability metrics. To access it:

```
/email-health/dashboard/{account_id}
```

The dashboard shows:
- Account overview (status, provider, limits)
- Authentication status (DKIM, SPF, DMARC)
- Delivery performance charts
- Key metrics (delivery rate, bounce rate, open rate, etc.)
- Error analysis with categorization
- Actionable recommendations

## 3. Email Health Check API

A REST API endpoint is available to get email account health data in JSON format:

```
GET /email-health/api/accounts/{account_id}/health?days=7
```

Parameters:
- `days`: Number of days of history to analyze (default: 7)

This endpoint returns comprehensive health data and can be used to integrate with external monitoring systems.

## 4. Command-Line Tools

### Email Deliverability Check

The `check_deliverability.py` script provides a simple way to check the deliverability status of an email account:

```bash
python check_deliverability.py --email user@example.com --days 7
```

Options:
- `--email`: Email address to check
- `--id`: Account ID to check (alternative to email)
- `--days`: Number of days of history to check (default: 7)
- `--format`: Output format (text, json, html)

### Batch Health Check

The `batch_health_check.py` script performs a health check on all email accounts and can generate reports:

```bash
python batch_health_check.py --days 7 --format html --output report.html
```

Options:
- `--days`: Number of days of history to analyze (default: 7)
- `--domain`: Filter by domain
- `--inactive`: Include inactive accounts
- `--format`: Output format (text, html, csv)
- `--email`: Email address to send report to
- `--output`: Output file path

This script also updates the account health scores in the database.

### SMTP Delivery Log Analysis

The `analyze_smtp_delivery_logs.py` script provides detailed analysis of email delivery logs:

```bash
python analyze_smtp_delivery_logs.py --account 123 --days 30
```

Options:
- `--account`: Specific account ID to analyze
- `--domain`: Specific domain to analyze
- `--days`: Number of days of history to analyze (default: 7)
- `--mode`: Analysis mode (account, domain, both)

## 5. Email Troubleshooting Guide

A comprehensive guide for troubleshooting email delivery issues is available in `email_troubleshooting_guide.md`. This guide covers:

- Understanding SMTP error categories
- Analyzing email logs
- Best practices for maintaining good deliverability
- Using the enhanced logging for troubleshooting

## Technical Details

### Error Categories

The system categorizes SMTP errors into the following types:

1. **Recipient Issues**
   - `invalid_recipient`: The recipient's email address does not exist
   - `mailbox_full`: The recipient's mailbox is full
   - `mailbox_busy`: The recipient's mailbox is temporarily unavailable
   - `user_not_local`: The recipient is not local to the receiving server

2. **Content Issues**
   - `spam_block`: The email was blocked due to spam-related issues
   - `content_violation`: The email content violates the recipient server's policy
   - `message_size_exceeded`: The email is too large

3. **Authentication Issues**
   - `authentication_error`: Authentication with the SMTP server failed

4. **Server Issues**
   - `service_unavailable`: The recipient server is temporarily unavailable
   - `connection_error`: Failed to establish a connection with the SMTP server
   - `connection_timeout`: The connection to the SMTP server timed out
   - `insufficient_system_storage`: The server has insufficient storage

5. **Other**
   - `permanent_failure`: Other permanent failures
   - `temporary_failure`: Other temporary failures
   - `general_smtp_error`: Default for unclassified errors

### Health Score Calculation

Account health scores (0-100) are calculated based on:

1. Delivery success rate (40% weight)
2. Bounce rate (30% weight)
3. Domain authentication (20% weight)
4. Engagement metrics (10% weight)

Health status categories:
- Excellent: 90-100
- Good: 75-89
- Fair: 50-74
- Poor: 0-49