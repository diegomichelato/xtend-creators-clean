# Gmail & SMTP Email Account Setup Guide

This guide explains how to set up and test email accounts in your system for sending emails through your platform.

## Prerequisites

Before you begin, make sure you have:

1. A Gmail account or other email account with SMTP access
2. For Gmail: An App Password (not your regular Gmail password)
3. Basic knowledge of your email provider's SMTP settings

## Getting an App Password for Gmail

Google doesn't allow regular passwords for SMTP access. Instead, you need to generate an App Password:

1. Go to your [Google Account Security settings](https://myaccount.google.com/security)
2. Make sure 2-Step Verification is turned on
3. Under "Signing in to Google," select "App passwords"
4. Generate a new app password for "Mail" and "Other (Custom name)"
5. Copy the 16-character password that appears

## Testing Your SMTP Settings

Before adding your email account to the system, it's recommended to test your SMTP settings:

```bash
# Test Gmail-specific SMTP settings
node test-gmail-smtp-settings.mjs
```

This will prompt you for your Gmail address, app password, and a test recipient, then attempt to send a test email.

## Adding an Email Account

There are several methods to add an email account:

### Method 1: Interactive Database Insert (Recommended)

This method directly inserts the account into the database:

```bash
# Interactive version
node direct-smtp-test-cli.mjs
```

Follow the prompts to enter your email details. This method is recommended as it handles database insertion directly.

### Method 2: API-based Method

This uses the application's API to create an account:

```bash
# Edit the account details first
nano add-smtp-account.js  # Edit your email details
node add-smtp-account.js  # Run the script

# OR use the interactive version
node add-smtp-account-prompt.js
```

## SMTP Settings Reference

### Gmail
- SMTP Host: `smtp.gmail.com`
- SMTP Port: `465` (SSL) or `587` (TLS)
- SMTP Security: `SSL/TLS`
- Username: Your full Gmail address
- Password: Your App Password (not regular Gmail password)

### Outlook/Office 365
- SMTP Host: `smtp.office365.com`
- SMTP Port: `587`
- SMTP Security: `STARTTLS`
- Username: Your full Outlook email
- Password: Your Outlook account password

### Yahoo Mail
- SMTP Host: `smtp.mail.yahoo.com`
- SMTP Port: `465` (SSL) or `587` (TLS)
- SMTP Security: `SSL/TLS`
- Username: Your Yahoo email address
- Password: Your app password (requires setup in Yahoo account)

## Troubleshooting

If you encounter issues:

1. Verify your app password is correct
2. Check if your email provider blocks SMTP access
3. Check if you need to enable "Less secure apps" (some providers)
4. Confirm your email daily/hourly limits are set correctly
5. Try using port 587 instead of 465 if connection issues occur

For Gmail-specific issues, a common problem is not using an App Password. Regular passwords will not work with Gmail SMTP.