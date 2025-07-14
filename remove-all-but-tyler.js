/**
 * Remove All But Tyler Script
 * This script removes all creators except Tyler Blanchard from the database
 */

// This code follows a direct database approach to ensure reliable cleanup

const { MemStorage } = require('./server/storage');
const storage = new MemStorage();

async function removeAllButTyler() {
  try {
    console.log("Starting cleanup process - keeping only Tyler Blanchard...");
    
    // Get all creators
    const creators = await storage.getAllCreators();
    console.log(`Found ${creators.length} creators in the database`);
    
    // Find Tyler Blanchard
    const tyler = creators.find(creator => 
      creator.name.toLowerCase().includes("tyler blanchard")
    );
    
    if (!tyler) {
      console.log("Tyler Blanchard not found in the database! No changes made.");
      return;
    }
    
    console.log(`Found Tyler Blanchard: ID=${tyler.id}, Name=${tyler.name}`);
    
    // Delete all other creators
    let deletedCount = 0;
    for (const creator of creators) {
      if (creator.id !== tyler.id) {
        console.log(`Deleting creator: ${creator.name} (ID: ${creator.id})`);
        await storage.deleteCreator(creator.id);
        deletedCount++;
      }
    }
    
    console.log(`Deleted ${deletedCount} creators. Only Tyler Blanchard remains.`);
    
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

// Run the function
removeAllButTyler()
  .then(() => console.log("Script completed"))
  .catch(err => console.error("Script failed:", err));