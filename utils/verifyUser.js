import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const verifyUser = ClerkExpressRequireAuth({
  strategy: 'authenticated',
  onError: (error) => {
    console.error("Clerk Authentication Error:", error);
  },
  onUnauthorized: (req, res) => {
    res.redirect('/login');
  }
});

export default verifyUser;