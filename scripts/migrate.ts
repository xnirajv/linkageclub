/* eslint-disable no-console */
import 'dotenv/config';

async function run() {
  console.log('No custom data migration is currently defined.');
  console.log('Add migration logic in scripts/migrate.ts when needed.');
}

run().catch((error) => {
  console.error('Migration script failed:', error);
  process.exit(1);
});
