/**
 * Setup Test Email Accounts
 * --------------------------
 * This script creates test email accounts and associates them with creators
 * to test the campaign email account selection functionality.
 */

import { db } from "./server/db";
import { emailAccounts, creatorEmailAccounts, creators } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  try {
    console.log("Setting up test email accounts...");
    
    // Get existing creators
    const existingCreators = await db.select().from(creators);
    
    if (existingCreators.length === 0) {
      console.log("No creators found. Please create creators first.");
      process.exit(1);
    }
    
    console.log(`Found ${existingCreators.length} creators`);
    
    // Create test email accounts
    const testAccounts = [
      {
        name: "Marketing Team",
        email: "marketing@example.com",
        provider: "smtp",
        status: "active",
        smtpHost: "smtp.example.com",
        smtpPort: 587,
        smtpUsername: "marketing@example.com",
        smtpPassword: "testpassword123",
        smtpSecure: false,
        dailyLimit: 100,
        warmupEnabled: true,
        userId: 1,
        notes: "Test marketing account"
      },
      {
        name: "Sales Team",
        email: "sales@example.com",
        provider: "smtp",
        status: "active",
        smtpHost: "smtp.example.com",
        smtpPort: 587,
        smtpUsername: "sales@example.com",
        smtpPassword: "testpassword123",
        smtpSecure: false,
        dailyLimit: 100,
        warmupEnabled: true,
        userId: 1,
        notes: "Test sales account"
      },
      {
        name: "Support Team",
        email: "support@example.com",
        provider: "smtp",
        status: "active",
        smtpHost: "smtp.example.com",
        smtpPort: 587,
        smtpUsername: "support@example.com",
        smtpPassword: "testpassword123",
        smtpSecure: false,
        dailyLimit: 100,
        warmupEnabled: true,
        userId: 1, 
        notes: "Test support account"
      }
    ];
    
    console.log("Creating test email accounts...");
    
    // Insert email accounts
    let accountsCreated = 0;
    for (const account of testAccounts) {
      try {
        // Check if account already exists
        const existing = await db.select()
          .from(emailAccounts)
          .where(eq(emailAccounts.email, account.email));
          
        if (existing.length > 0) {
          console.log(`Account ${account.email} already exists, skipping`);
          continue;
        }
        
        // Insert the account
        const [newAccount] = await db.insert(emailAccounts).values(account).returning();
        console.log(`Created email account: ${newAccount.email} (ID: ${newAccount.id})`);
        accountsCreated++;
        
        // Associate with creators
        for (let i = 0; i < existingCreators.length; i++) {
          const creator = existingCreators[i];
          
          // Make the first account primary for this creator
          const isPrimary = i === 0;
          
          // Check if association already exists
          const existingAssoc = await db.select()
            .from(creatorEmailAccounts)
            .where(
              eq(creatorEmailAccounts.creatorId, creator.id),
              eq(creatorEmailAccounts.emailAccountId, newAccount.id)
            );
            
          if (existingAssoc.length > 0) {
            console.log(`Association between creator ${creator.id} and account ${newAccount.id} already exists, skipping`);
            continue;
          }
          
          // Create association
          await db.insert(creatorEmailAccounts).values({
            creatorId: creator.id,
            emailAccountId: newAccount.id,
            isPrimary: isPrimary
          });
          
          console.log(`Associated email account ${newAccount.id} with creator ${creator.id} (isPrimary: ${isPrimary})`);
        }
      } catch (error) {
        console.error(`Error creating account ${account.email}:`, error);
      }
    }
    
    console.log(`Created ${accountsCreated} email accounts and associated them with creators`);
    console.log("Setup complete!");
    
  } catch (error) {
    console.error("Error setting up test email accounts:", error);
  } finally {
    process.exit(0);
  }
}

main();