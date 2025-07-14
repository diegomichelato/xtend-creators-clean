// Fix User Session Script
// This script fixes the user session to use proper UUID format for Supabase

console.log("🔧 Fixing user session for Supabase compatibility...");

// Clear any existing problematic user session
localStorage.removeItem('user');

// Create a proper UUID-based user session
const properUser = {
  id: "47440a8a-e5ae-4f38-8c92-7fccf9387017", // Proper UUID format
  uuid: "47440a8a-e5ae-4f38-8c92-7fccf9387017",
  email: "admin@xtendcreators.com",
  name: "Admin User",
  role: "admin",
  firstName: "Admin",
  lastName: "User"
};

// Set the corrected user session
localStorage.setItem('user', JSON.stringify(properUser));

console.log("✅ User session fixed! User ID:", properUser.id);
console.log("🔄 Please refresh the page to apply changes.");