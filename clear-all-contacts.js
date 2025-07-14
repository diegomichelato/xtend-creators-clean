/**
 * Clear All Contacts Script
 * ------------------------
 * This script removes all contacts from the database
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function clearAllContacts() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🗑️  Starting to clear all contacts...');
    
    // First, delete all contact list entries (due to foreign key constraints)
    const deleteContactListEntriesResult = await pool.query('DELETE FROM contact_list_entries');
    console.log(`✅ Removed ${deleteContactListEntriesResult.rowCount} contact list entries`);
    
    // Then delete all contacts
    const deleteContactsResult = await pool.query('DELETE FROM contacts');
    console.log(`✅ Removed ${deleteContactsResult.rowCount} contacts`);
    
    console.log('🎉 All contacts have been successfully removed!');
    
  } catch (error) {
    console.error('❌ Error clearing contacts:', error);
  } finally {
    await pool.end();
  }
}

clearAllContacts();