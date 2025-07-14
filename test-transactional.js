import { sendEmail } from './email.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test SendGrid Integration
 * This script tests the SendGrid email functionality
 */

async function testSendGridConnection() {
  console.log('🧪 Testing SendGrid Transactional Email System');
  console.log('='.repeat(50));
  
  // Check environment variables
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not found in environment variables');
    console.log('Please set SENDGRID_API_KEY in your .env file');
    return false;
  }
  
  if (!process.env.FROM_EMAIL) {
    console.log('⚠️  FROM_EMAIL not set, using default: no-reply@system.xtendcreator.com');
  }
  
  console.log(`📧 From Email: ${process.env.FROM_EMAIL || 'no-reply@system.xtendcreator.com'}`);
  console.log(`🔑 API Key: ${process.env.SENDGRID_API_KEY.substring(0, 10)}...`);
  
  // Test email data
  const testEmailData = {
    to: 'test@example.com', // Change this to your test email
    subject: 'SendGrid Test Email - Xtend Creator',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00a99d;">SendGrid Test Email</h1>
        <p>This is a test email from the Xtend Creator transactional email system.</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #00a99d;">
          <p><strong>✅ SendGrid integration is working correctly!</strong></p>
        </div>
        <p>Time sent: ${new Date().toISOString()}</p>
        <p>If you received this email, the SendGrid configuration is working properly.</p>
      </div>
    `,
    text: 'SendGrid test email - if you received this, the integration is working!'
  };
  
  try {
    console.log('\n📤 Attempting to send test email...');
    const success = await sendEmail(testEmailData);
    
    if (success) {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Check your inbox for the test email');
      return true;
    } else {
      console.log('❌ Test email failed to send');
      return false;
    }
    
  } catch (error) {
    console.error('❌ SendGrid test failed:', error.message);
    return false;
  }
}

// Test API endpoints with curl examples
function displayApiExamples() {
  console.log('\n📋 API Endpoint Examples:');
  console.log('='.repeat(30));
  
  const baseUrl = 'http://localhost:3000';
  
  console.log('\n1. Register User (Welcome Email):');
  console.log(`curl -X POST ${baseUrl}/api/register \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"email":"user@example.com","name":"John Doe","username":"johndoe"}'`);
  
  console.log('\n2. Forgot Password:');
  console.log(`curl -X POST ${baseUrl}/api/forgot-password \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"email":"user@example.com"}'`);
  
  console.log('\n3. Password Reset Success:');
  console.log(`curl -X POST ${baseUrl}/api/password-reset-success \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"email":"user@example.com"}'`);
  
  console.log('\n4. Send Verification Email:');
  console.log(`curl -X POST ${baseUrl}/api/send-verification \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"email":"user@example.com"}'`);
  
  console.log('\n5. Verify Email:');
  console.log(`curl "${baseUrl}/api/verify-email?token=YOUR_TOKEN_HERE"`);
  
  console.log('\n6. Health Check:');
  console.log(`curl "${baseUrl}/health"`);
}

// Main test function
async function runTests() {
  console.log('🚀 Starting SendGrid Transactional Email Tests\n');
  
  const sendGridWorking = await testSendGridConnection();
  
  if (sendGridWorking) {
    console.log('\n🎉 SendGrid integration test passed!');
    console.log('You can now start the server with: node transactional-server.js');
    displayApiExamples();
  } else {
    console.log('\n❌ SendGrid integration test failed');
    console.log('Please check your SENDGRID_API_KEY and FROM_EMAIL configuration');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testSendGridConnection, displayApiExamples };