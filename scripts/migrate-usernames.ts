import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Import your models and utilities
import User from '../src/lib/db/models/user';
import connectDB from '../src/lib/db/connect';
import { getUniqueUsername } from '../src/lib/utils/username';

async function migrateUsernames() {
  try {
    // 1. Connect to Database
    await connectDB();
    console.log('✅ Database connected successfully');

    // 2. Find all users without a username
    const users = await User.find({ 
      username: { $exists: false } // Only users missing the username field
    });

    console.log(`📊 Found ${users.length} users without username`);

    if (users.length === 0) {
      console.log('🎉 All users already have usernames! Nothing to migrate.');
      process.exit(0);
    }

    // 3. Loop through and generate usernames
    for (const user of users) {
      try {
        const username = await getUniqueUsername(user.name, User);
        user.username = username;
        await user.save();
        console.log(`✅ ${user.name} (${user.email}) → ${username}`);
      } catch (err) {
        console.error(`❌ Failed for ${user.name} (${user.email}):`, err);
      }
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateUsernames();