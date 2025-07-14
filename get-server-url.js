/**
 * Get Server URL Script
 * -------------------
 * This script detects and displays the URL of your running server
 */

import http from 'http';

// Function to check if a port is in use
async function checkPort(port) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 1000,
    };
    
    const req = http.request(options, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Function to get the replit app URL, if we're running on Replit
function getReplitAppUrl() {
  // Check if we're running on Replit by checking environment variables
  if (process.env.REPL_ID) {
    // Get hostname from the document if available (browser environment)
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return `https://${window.location.hostname}`;
    }
    
    // Fallback to traditional Replit URL construction
    if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      return `https://${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.replit.app`;
    }
  }
  return null;
}

// Main function
async function main() {
  console.log('Detecting server URL...');
  
  // Check if the server is running on the standard port 5000
  const isLocal = await checkPort(5000);
  const replitUrl = getReplitAppUrl();
  
  if (isLocal) {
    console.log('\nServer detected on localhost:5000');
    console.log('To add an email account, use:');
    console.log('export SERVER_URL=http://localhost:5000');
  } 
  
  if (replitUrl) {
    console.log(`\nReplit URL detected: ${replitUrl}`);
    console.log('To add an email account, use:');
    console.log(`export SERVER_URL=${replitUrl}`);
  }
  
  // Get the URL from the environment if it's already set
  if (process.env.SERVER_URL) {
    console.log(`\nEnvironment variable SERVER_URL is set to: ${process.env.SERVER_URL}`);
  }
  
  // Instructions for running the account scripts
  console.log('\nTo add an email account using the provided scripts:');
  console.log('1. Set the SERVER_URL environment variable (if not already set)');
  console.log('2. Run one of the following:');
  console.log('   - node add-smtp-account.js (edit the file first with your details)');
  console.log('   - node add-smtp-account-prompt.js (interactive version)');
}

// Run the script
main();