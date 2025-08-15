import { createClerkClient } from '@clerk/clerk-sdk-node';
import 'dotenv/config'; // Load environment variables

// Create a custom clerkClient instance using your secret key
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY // Use secret key from environment variables
});

// Export the custom clerkClient instance for use in other parts of the app
export { clerkClient };
