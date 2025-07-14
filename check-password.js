/**
 * Simple Password Check Script
 * --------------------------
 * This script just checks the password variables without doing any SMTP
 */

console.log('GMAIL_APP_PASSWORD details:');
const password = process.env.GMAIL_APP_PASSWORD || '';
console.log('- Exists:', !!password);
console.log('- Length:', password.length);
console.log('- Type:', typeof password);

// Show character codes to see if there are any issues
console.log('\nCharacter details:');
if (password) {
  const codes = [...password].map(c => c.charCodeAt(0));
  console.log('- Character codes:', codes);
  
  // Special characters check
  const specialChars = [...password].filter(c => {
    const code = c.charCodeAt(0);
    return code < 32 || code > 126;
  });
  
  if (specialChars.length > 0) {
    console.log('- Contains special characters:', specialChars);
  } else {
    console.log('- No special characters detected');
  }
  
  // Whitespace check
  const whitespace = [...password].filter(c => /\s/.test(c));
  if (whitespace.length > 0) {
    console.log('- Contains whitespace:', whitespace);
  } else {
    console.log('- No whitespace detected');
  }
  
  console.log('- Raw string (quoted):', JSON.stringify(password));
}

// Print the raw base64 encoded version (what will be sent to SMTP server)
const authString = `\0patrick@xtendtalent.com\0${password}`;
const encodedAuth = Buffer.from(authString).toString('base64');
console.log('\nAuthorization string details:');
console.log('- Base64 encoded length:', encodedAuth.length);
console.log('- Encoded auth string:', encodedAuth);