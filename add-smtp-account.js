/**
 * Add SMTP Account Script
 * ----------------------
 * This script adds a Gmail SMTP account to your system
 * Edit the accountData object below with your actual credentials
 */

import axios from 'axios';

// Get server URL from environment
const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

// Define your email account details here
const accountData = {
  email: "your-email@gmail.com", // Replace with your actual email
  name: "My Gmail Account",      // Replace with a friendly name
  provider: "gmail",
  status: "active",
  
  // SMTP configuration
  smtpHost: "smtp.gmail.com",
  smtpPort: 465,
  smtpUsername: "your-email@gmail.com", // Replace with your actual email
  smtpPassword: "your-password-or-app-password", // Replace with your password or app password
  smtpSecure: true,
  
  // Email limits
  dailyLimit: 100,
  hourlyLimit: 20,
  
  // Optional settings
  warmupEnabled: false,
  domainAuthenticated: false,
  notes: "Added manually via script",
};

async function addEmailAccount() {
  try {
    console.log('Adding email account...');
    
    // Make API call to create email account
    const response = await axios.post(`${serverUrl}/api/email-accounts`, accountData);
    
    console.log('Email account created successfully:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error adding email account:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// Run the function
addEmailAccount()
  .then(() => {
    console.log('Script completed successfully');
  })
  .catch(err => {
    console.error('Script failed:', err.message);
    process.exit(1);
  });