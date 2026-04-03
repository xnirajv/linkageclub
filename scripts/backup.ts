/* eslint-disable no-console */
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { promisify } from 'node:util';
import { MongoClient } from 'mongodb';

const gzip = promisify(zlib.gzip);

async function run() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is required to create a database backup.');
  }

  const client = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  await client.connect();

  try {
    const db = client.db(process.env.MONGODB_DB);
    const collections = await db.listCollections().toArray();

    const backupRoot = path.join(process.cwd(), 'backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(backupRoot, timestamp);

    await fs.mkdir(backupDir, { recursive: true });

    const manifest = {
      createdAt: new Date().toISOString(),
      database: db.databaseName,
      collections: [] as Array<{ name: string; documentCount: number; file: string }>,
    };

    for (const collectionInfo of collections) {
      const collection = db.collection(collectionInfo.name);
      const documents = await collection.find({}).toArray();
      const fileName = `${collectionInfo.name}.json.gz`;
      const filePath = path.join(backupDir, fileName);
      const compressed = await gzip(JSON.stringify(documents, null, 2));

      await fs.writeFile(filePath, compressed);
      manifest.collections.push({
        name: collectionInfo.name,
        documentCount: documents.length,
        file: fileName,
      });
    }

    await fs.writeFile(
      path.join(backupDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf8'
    );

    console.log(`Backup created at ${backupDir}`);
    console.log('Recommendation: schedule `npm run backup` via cron/Task Scheduler and copy the backups directory to off-site object storage.');
  } finally {
    await client.close();
  }
}

run().catch((error) => {
  console.error('Backup script failed:', error);
  process.exit(1);
});
