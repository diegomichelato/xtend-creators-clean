/**
 * Health Check Routes
 * Provides system health monitoring endpoints for production deployment
 */
import { Router } from 'express';
import { db } from './db.js';

const router = Router();

/**
 * Basic health check endpoint
 * Returns server status and timestamp
 */
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    const dbCheck = await db.execute('SELECT 1 as healthy');
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        email: process.env.SENDGRID_API_KEY ? 'configured' : 'not_configured'
      },
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: 'disconnected',
        email: process.env.SENDGRID_API_KEY ? 'configured' : 'not_configured'
      }
    });
  }
});

/**
 * Detailed health check with service dependencies
 */
router.get('/health/detailed', async (req, res) => {
  const checks = {
    database: false,
    sendgrid: false,
    environment: false
  };

  try {
    // Database connectivity check
    await db.execute('SELECT 1');
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  // SendGrid configuration check
  checks.sendgrid = !!process.env.SENDGRID_API_KEY;

  // Environment variables check
  checks.environment = !!(
    process.env.SENDGRID_API_KEY &&
    process.env.SENDGRID_VERIFIED_SENDER_EMAIL
  );

  const allHealthy = Object.values(checks).every(Boolean);

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    node_version: process.version
  });
});

export { router as healthRouter };