/**
 * Scheduled Email Processing Script
 * -------------------------------
 * This script can be called from a cron job to process scheduled emails
 * Run it every few minutes to ensure scheduled emails are sent on time
 */

const axios = require('axios');

// Get the base URL from environment or use localhost for development
const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
const apiKey = process.env.EMAIL_PROCESSOR_API_KEY || 'development-key';

async function processScheduledEmails() {
  console.log('Starting scheduled email processing...');
  
  try {
    const response = await axios.post(
      `${baseUrl}/api/process-scheduled-emails`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        }
      }
    );
    
    console.log('Email processing results:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error processing scheduled emails:', error.response?.data || error.message);
    throw error;
  }
}

// Execute the function directly if run as a script
if (require.main === module) {
  processScheduledEmails()
    .then(() => {
      console.log('Email processing complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('Email processing failed:', error);
      process.exit(1);
    });
} else {
  // Export for use as a module
  module.exports = { processScheduledEmails };
}