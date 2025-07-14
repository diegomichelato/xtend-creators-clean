// server/routes/campaignRoutes.ts
import express from 'express';
import { storage } from '../storage';

const router = express.Router();

// Get all campaigns with campaign management data
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching campaigns with management data...');

    // Get campaigns from your existing storage
    const campaigns = await storage.getAllCampaigns();

    // Enhance with mock management data for now
    const enhancedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name || 'Untitled Campaign',
      brandName: 'TechFlow Solutions', // We'll connect this to brands table later
      creatorName: 'Sophia Lee', // We'll connect this to creators table later
      status: campaign.status || 'draft',
      budget: 5000,
      estimated_duration: 30,
      created_at: campaign.createdAt || new Date().toISOString(),
      milestones: [
        {
          id: '1',
          name: 'Project Kickoff',
          status: 'completed',
          milestone_type: 'project_start'
        },
        {
          id: '2',
          name: 'Brand Briefing',
          status: 'in_progress',
          milestone_type: 'briefing_delivery'
        }
      ]
    }));

    res.json({
      success: true,
      data: enhancedCampaigns
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new campaign
router.post('/', async (req, res) => {
  try {
    console.log('📋 Creating new campaign:', req.body);

    const { name, brandId, creatorIds, goals, budget } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Campaign name is required'
      });
    }

    // Create campaign using your existing storage
    const campaignData = {
      name,
      objective: goals || 'Brand awareness',
      status: 'draft',
      creatorId: 16, // Sophia Lee's ID from your existing data
      contactListId: 25, // Use existing contact list
      tone: 'professional',
      sequenceCount: 3
    };

    const campaign = await storage.createCampaign(campaignData);

    res.status(201).json({
      success: true,
      data: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        created_at: new Date().toISOString()
      },
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign'
    });
  }
});

// Get brands for dropdown
router.get('/brands', async (req, res) => {
  try {
    const brands = [
      { id: '1', name: 'TechFlow Solutions' },
      { id: '2', name: 'Bl