/**
 * Setup Test Data Script
 * ----------------------
 * This script sets up test data for the application including creators, 
 * contact lists, email accounts, and campaigns for testing.
 */

import { db } from "./server/db";
import { creators, emailAccounts, creatorEmailAccounts, contactLists, contacts } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  try {
    console.log("Setting up test data...");
    
    // Create test creators if they don't exist
    const testCreators = [
      {
        name: "Sarah Johnson",
        role: "Fitness Influencer",
        bio: "Professional fitness trainer specializing in HIIT workouts and nutrition advice for busy professionals.",
        brandVoice: "Motivational and encouraging, focused on achievable goals and sustainable fitness journeys.",
        profileColor: "#4CAF50",
        initials: "SJ",
        userId: 1,
        lastUpdated: new Date()
      },
      {
        name: "Tech Insights",
        role: "Technology Channel",
        bio: "Providing in-depth analysis of emerging tech trends, product reviews, and industry insights.",
        brandVoice: "Analytical and informative, translating complex tech concepts into accessible explanations.",
        profileColor: "#2196F3",
        initials: "TI",
        userId: 1,
        lastUpdated: new Date()
      },
      {
        name: "Culinary Adventures",
        role: "Food & Travel Creator",
        bio: "Exploring global cuisines and sharing authentic recipes gathered from travels around the world.",
        brandVoice: "Warm and descriptive, emphasizing cultural context and sensory experiences of food.",
        profileColor: "#FF9800",
        initials: "CA",
        userId: 1,
        lastUpdated: new Date()
      }
    ];
    
    // Insert creators
    let creatorsCreated = 0;
    for (const creator of testCreators) {
      try {
        // Check if creator already exists
        const existing = await db.select()
          .from(creators)
          .where(eq(creators.name, creator.name));
          
        if (existing.length > 0) {
          console.log(`Creator ${creator.name} already exists, skipping`);
          continue;
        }
        
        // Insert the creator
        const [newCreator] = await db.insert(creators).values(creator).returning();
        console.log(`Created creator: ${newCreator.name} (ID: ${newCreator.id})`);
        creatorsCreated++;
        
        // Create a test contact list for this creator
        const [contactList] = await db.insert(contactLists).values({
          name: `${creator.name}'s Prospects`,
          description: `Test contact list for ${creator.name}`,
          userId: 1,
          createdAt: new Date()
        }).returning();
        
        console.log(`Created contact list: ${contactList.name} (ID: ${contactList.id})`);
        
        // Add some test contacts to the list
        const testContacts = [
          {
            firstName: "John",
            lastName: "Smith",
            email: `john.smith.${newCreator.id}@example.com`,
            company: "Acme Corp",
            industry: "Technology",
            role: "Marketing Director",
            contactListId: contactList.id,
            status: "active",
            tags: ["interested", "high-value"],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            firstName: "Emily",
            lastName: "Johnson",
            email: `emily.johnson.${newCreator.id}@example.com`,
            company: "Global Enterprises",
            industry: "Finance",
            role: "CEO",
            contactListId: contactList.id,
            status: "active",
            tags: ["decision-maker"],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            firstName: "Michael",
            lastName: "Williams",
            email: `michael.williams.${newCreator.id}@example.com`,
            company: "Tech Innovations",
            industry: "Technology",
            role: "CTO",
            contactListId: contactList.id,
            status: "active",
            tags: ["technical", "decision-maker"],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        for (const contact of testContacts) {
          await db.insert(contacts).values(contact);
        }
        
        console.log(`Added ${testContacts.length} contacts to list ${contactList.id}`);
        
        // Create an email account for this creator if one doesn't exist
        const emailAccountName = `${creator.name.replace(/\s+/g, '.')}@example.com`;
        
        // Check if account already exists
        const existingAccount = await db.select()
          .from(emailAccounts)
          .where(eq(emailAccounts.email, emailAccountName));
          
        if (existingAccount.length === 0) {
          // Create new account
          const [emailAccount] = await db.insert(emailAccounts).values({
            name: creator.name,
            email: emailAccountName,
            provider: "smtp",
            status: "active",
            smtpHost: "smtp.example.com",
            smtpPort: 587,
            smtpUsername: emailAccountName,
            smtpPassword: "testpassword123",
            smtpSecure: false,
            dailyLimit: 100,
            warmupEnabled: true,
            userId: 1,
            notes: `Test account for ${creator.name}`
          }).returning();
          
          console.log(`Created email account: ${emailAccount.email} (ID: ${emailAccount.id})`);
          
          // Associate with creator as primary
          await db.insert(creatorEmailAccounts).values({
            creatorId: newCreator.id,
            emailAccountId: emailAccount.id,
            isPrimary: true
          });
          
          console.log(`Associated email account ${emailAccount.id} with creator ${newCreator.id} as primary`);
        } else {
          console.log(`Email account ${emailAccountName} already exists, skipping`);
        }
      } catch (error) {
        console.error(`Error creating data for ${creator.name}:`, error);
      }
    }
    
    console.log(`Created ${creatorsCreated} creators with associated data`);
    console.log("Setup complete!");
    
  } catch (error) {
    console.error("Error setting up test data:", error);
  } finally {
    process.exit(0);
  }
}

main();