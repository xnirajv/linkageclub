import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/db/client';

export const adapter = MongoDBAdapter(clientPromise, {
  databaseName: process.env.MONGODB_DB || 'internhub',
  collections: {
    Users: 'users',
    Accounts: 'accounts',
    Sessions: 'sessions',
    VerificationTokens: 'verification_tokens',
  },
});

export default adapter;