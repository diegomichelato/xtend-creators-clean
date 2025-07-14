import { type Express } from "express";
import { workingGmailService } from '../gmail-service-working';

export function registerGmailRoutes(app: Express) {

  // Test route
  app.get("/api/gmail/test", async (req, res) => {
    try {
      const result = await workingGmailService.testConnection('test-user-123');
      res.json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get OAuth URL
  app.get("/api/gmail/auth-url", async (req, res) => {
    try {
      const authUrl = workingGmailService.getAuthUrl('test-user-123');
      res.json({
        success: true,
        authUrl: authUrl
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  console.log('📧 Gmail routes registered successfully');
}