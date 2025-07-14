/**
 * Keep Only Tyler Script
 * -------------------
 * This script removes all creators except Tyler Blanchard from the database
 */

// CommonJS imports for compatibility
const { createStorage } = require('./server/storage');

async function keepOnlyTyler() {
  try {
    console.log("Starting cleanup process - keeping only Tyler Blanchard...");
    
    // Create database storage
    const storage = createStorage(db);
    
    // Get all creators
    const creators = await storage.getAllCreators();
    console.log(`Found ${creators.length} creators in the database`);
    
    // Find Tyler Blanchard
    const tyler = creators.find(creator => 
      creator.name === "Tyler Blanchard" || 
      creator.name.toLowerCase().includes("tyler")
    );
    
    if (!tyler) {
      console.log("Tyler Blanchard not found in the database! No changes made.");
      return;
    }
    
    console.log(`Found Tyler Blanchard: ID=${tyler.id}`);
    
    // Delete all other creators
    for (const creator of creators) {
      if (creator.id !== tyler.id) {
        console.log(`Deleting creator: ${creator.name} (ID: ${creator.id})`);
        await storage.deleteCreator(creator.id);
      }
    }
    
    console.log("Cleanup complete. Only Tyler Blanchard remains in the database.");
    
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

// Run the function
keepOnlyTyler()
  .then(() => console.log("Script completed"))
  .catch(err => console.error("Script failed:", err));