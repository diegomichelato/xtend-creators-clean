import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Enhanced SendGrid email sending function with comprehensive logging
 * @param {Object} emailData - Email configuration
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.html - HTML content (optional)
 * @param {string} emailData.text - Plain text content (optional)
 * @param {string} emailData.templateId - SendGrid template ID (optional)
 * @param {Object} emailData.dynamicTemplateData - Template variables (optional)
 * @returns {Promise<Object>} Detailed response with success status, messageId, and error details
 */
async function sendEmail(emailData) {
  const startTime = Date.now();
  
  try {
    // Validate required fields
    if (!emailData.to) {
      throw new Error('Recipient email address is required');
    }
    
    if (!emailData.subject && !emailData.templateId) {
      throw new Error('Email subject is required when not using a template');
    }

    const msg = {
      to: emailData.to,
      from: process.env.SENDGRID_VERIFIED_SENDER_EMAIL || process.env.FROM_EMAIL || 'no-reply@system.xtendcreator.com',
    };

    // Handle template vs custom content
    if (emailData.templateId) {
      msg.templateId = emailData.templateId;
      if (emailData.dynamicTemplateData) {
        msg.dynamicTemplateData = emailData.dynamicTemplateData;
      }
      console.log(`📧 Sending templated email (${emailData.templateId}) to: ${emailData.to}`);
    } else {
      msg.subject = emailData.subject;
      msg.html = emailData.html;
      msg.text = emailData.text || null;
      console.log(`📧 Sending custom email to: ${emailData.to}`);
      console.log(`📧 Subject: ${emailData.subject}`);
    }

    console.log(`📧 From: ${msg.from}`);
    console.log(`📤 Sending email via SendGrid...`);

    const response = await sgMail.send(msg);
    
    const duration = Date.now() - startTime;
    const messageId = response[0].headers['x-message-id'];
    const statusCode = response[0].statusCode;
    
    // Enhanced success logging
    console.log('✅ Email sent successfully via SendGrid!');
    console.log(`📧 Message ID: ${messageId}`);
    console.log(`📊 Status Code: ${statusCode}`);
    console.log(`⏱️ Send Duration: ${duration}ms`);
    
    // Log full response for debugging
    console.log('📋 Full SendGrid Response:', {
      messageId,
      statusCode,
      headers: response[0].headers,
      body: response[0].body
    });
    
    return {
      success: true,
      messageId,
      statusCode,
      duration,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Enhanced error logging
    console.error('❌ SendGrid email error occurred');
    console.error(`⏱️ Failed after: ${duration}ms`);
    console.error(`🎯 Attempted to send to: ${emailData.to}`);
    
    // Log error details
    if (error.response) {
      console.error(`📊 HTTP Status: ${error.response.status || 'Unknown'}`);
      console.error(`📋 Error Body:`, error.response.body);
      
      // Log specific SendGrid error details
      if (error.response.body && error.response.body.errors) {
        console.error('🔍 SendGrid Error Details:');
        error.response.body.errors.forEach((err, index) => {
          console.error(`  ${index + 1}. ${err.message} (Field: ${err.field || 'N/A'})`);
        });
      }
    } else {
      console.error('📋 Error Message:', error.message);
      console.error('📋 Error Stack:', error.stack);
    }
    
    return {
      success: false,
      error: error.message,
      statusCode: error.response?.status || null,
      errorDetails: error.response?.body || null,
      duration,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Add new email types here:
 * 
 * Example functions for different email types:
 * - sendWelcomeEmail(userEmail, userName, tempPassword)
 * - sendPasswordResetEmail(userEmail, resetToken)
 * - sendVerificationEmail(userEmail, verificationToken)
 * - sendInvoiceEmail(userEmail, invoiceData)
 * - sendNotificationEmail(userEmail, notificationData)
 * 
 * Template for adding new email type:
 * 
 * async function sendCustomEmail(recipientEmail, customData) {
 *   return await sendEmail({
 *     to: recipientEmail,
 *     subject: 'Your Custom Subject',
 *     html: '<h1>Your HTML content</h1>',
 *     text: 'Your plain text content'
 *   });
 * }
 */

export { sendEmail };