/**
 * SendGrid Categories Test Script
 * Tests the category tagging system for different email types
 */

import fetch from 'node-fetch';

async function testEmailCategories() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Testing SendGrid category system...\n');

  // Test 1: Outreach email
  console.log('1. Testing outreach email categories...');
  try {
    const outreachResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_address: 'test@example.com',
        subject: 'Test Outreach Email',
        body: 'This is a test outreach email to verify category tagging.',
        campaign_id: 'test-campaign-123',
        user_id: '1',
        email_type: 'outreach',
        use_authenticated_domain: true
      })
    });

    if (outreachResponse.ok) {
      console.log('✅ Outreach email sent successfully');
      console.log('Expected categories: ["outreach", "creator-1", "campaign-test-campaign-123"]');
    } else {
      const error = await outreachResponse.text();
      console.log('❌ Outreach email failed:', error);
    }
  } catch (error) {
    console.log('❌ Error testing outreach email:', error.message);
  }

  // Test 2: Newsletter email
  console.log('\n2. Testing newsletter email categories...');
  try {
    const newsletterResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_address: 'test@example.com',
        subject: 'Weekly Newsletter',
        body: 'This is a test newsletter email to verify category tagging.',
        user_id: '1',
        email_type: 'newsletter',
        use_authenticated_domain: true
      })
    });

    if (newsletterResponse.ok) {
      console.log('✅ Newsletter email sent successfully');
      console.log('Expected categories: ["news", "newsletter"]');
    } else {
      const error = await newsletterResponse.text();
      console.log('❌ Newsletter email failed:', error);
    }
  } catch (error) {
    console.log('❌ Error testing newsletter email:', error.message);
  }

  // Test 3: System email
  console.log('\n3. Testing system email categories...');
  try {
    const systemResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_address: 'test@example.com',
        subject: 'System Alert: Account Update',
        body: 'This is a test system email to verify category tagging.',
        user_id: '1',
        email_type: 'system',
        event_type: 'account_update',
        use_authenticated_domain: true
      })
    });

    if (systemResponse.ok) {
      console.log('✅ System email sent successfully');
      console.log('Expected categories: ["system-alert", "event-account_update"]');
    } else {
      const error = await systemResponse.text();
      console.log('❌ System email failed:', error);
    }
  } catch (error) {
    console.log('❌ Error testing system email:', error.message);
  }

  // Test 4: General email (fallback)
  console.log('\n4. Testing general email categories...');
  try {
    const generalResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_address: 'test@example.com',
        subject: 'General Email',
        body: 'This is a test general email to verify category tagging.',
        user_id: '1',
        use_authenticated_domain: true
      })
    });

    if (generalResponse.ok) {
      console.log('✅ General email sent successfully');
      console.log('Expected categories: ["general"]');
    } else {
      const error = await generalResponse.text();
      console.log('❌ General email failed:', error);
    }
  } catch (error) {
    console.log('❌ Error testing general email:', error.message);
  }

  console.log('\n🏁 Category testing complete!');
  console.log('\nNote: Check your SendGrid dashboard and database to verify:');
  console.log('- Categories appear correctly in SendGrid analytics');
  console.log('- Email records in database contain proper category tags');
}

testEmailCategories().catch(console.error);