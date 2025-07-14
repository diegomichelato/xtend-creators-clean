/**
 * Add SMTP Account Script (Interactive Version)
 * -------------------------------------------
 * This script prompts for SMTP account details and adds them to your system
 */

import axios from 'axios';
import readline from 'readline';

// Create readline interface for prompting
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Get server URL from environment or localhost
const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

async function collectAccountData() {
  console.log('\n=== SMTP Email Account Setup ===\n');
  
  // Email details
  const email = await prompt('Email address: ');
  const name = await prompt('Account name (for display): ');
  
  // SMTP configuration
  console.log('\n-- SMTP Configuration --');
  const smtpHost = await prompt('SMTP Host [smtp.gmail.com]: ') || 'smtp.gmail.com';
  const smtpPortStr = await prompt('SMTP Port [465]: ') || '465';
  const smtpPort = parseInt(smtpPortStr);
  const smtpUsername = await prompt(`SMTP Username [${email}]: `) || email;
  const smtpPassword = await prompt('SMTP Password/App Password: ');
  const smtpSecureStr = await prompt('Use Secure Connection? (yes/no) [yes]: ') || 'yes';
  const smtpSecure = smtpSecureStr.toLowerCase() === 'yes';
  
  // Email limits
  console.log('\n-- Email Sending Limits --');
  const dailyLimitStr = await prompt('Daily sending limit [100]: ') || '100';
  const dailyLimit = parseInt(dailyLimitStr);
  const hourlyLimitStr = await prompt('Hourly sending limit [20]: ') || '20';
  const hourlyLimit = parseInt(hourlyLimitStr);
  
  // Optional settings
  console.log('\n-- Additional Settings --');
  const warmupEnabledStr = await prompt('Enable email warmup? (yes/no) [no]: ') || 'no';
  const warmupEnabled = warmupEnabledStr.toLowerCase() === 'yes';
  const domainAuthenticatedStr = await prompt('Domain authenticated? (yes/no) [no]: ') || 'no';
  const domainAuthenticated = domainAuthenticatedStr.toLowerCase() === 'yes';
  const notes = await prompt('Notes (optional): ');
  
  return {
    email,
    name,
    provider: smtpHost.includes('gmail') ? 'gmail' : 
              smtpHost.includes('outlook') || smtpHost.includes('office365') ? 'outlook' : 
              smtpHost.includes('yahoo') ? 'yahoo' : 
              'smtp',
    status: 'active',
    smtpHost,
    smtpPort,
    smtpUsername,
    smtpPassword,
    smtpSecure,
    dailyLimit,
    hourlyLimit,
    warmupEnabled,
    domainAuthenticated,
    notes
  };
}

async function addEmailAccount(accountData) {
  try {
    console.log('\nAdding email account...');
    
    // Make API call to create email account
    const response = await axios.post(`${serverUrl}/api/email-accounts`, accountData);
    
    console.log('\nEmail account created successfully:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('\nError adding email account:');
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

// Main function
async function main() {
  try {
    // Collect account data from user
    const accountData = await collectAccountData();
    
    // Confirm the data
    console.log('\n=== Account Summary ===');
    const safeSummary = {...accountData, smtpPassword: '********'};
    console.log(JSON.stringify(safeSummary, null, 2));
    
    const confirmAdd = await prompt('\nAdd this account? (yes/no): ');
    if (confirmAdd.toLowerCase() !== 'yes') {
      console.log('Operation cancelled');
      rl.close();
      return;
    }
    
    // Add the account
    await addEmailAccount(accountData);
    console.log('\nEmail account has been added to the system.');
  } catch (error) {
    console.error('Failed to complete operation:', error.message);
  } finally {
    rl.close();
  }
}

// Run the script
main();