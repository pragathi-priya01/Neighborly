import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB, disconnectDB, maskMongoUri } from '../config/db.js';
import { User, Service } from '../models/index.js';

const runDbVerification = async () => {
  console.log('================================================================');
  console.log('       Neighbourly - MongoDB Connection Verification           ');
  console.log('================================================================');

  const uri = env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in server/.env');
    console.log('Please set MONGODB_URI in server/.env to your MongoDB Atlas connection string.');
    process.exit(1);
  }

  const isAtlas = uri.startsWith('mongodb+srv://') || uri.includes('.mongodb.net');
  console.log(`📡 Target URI:   ${maskMongoUri(uri)}`);
  console.log(`🌐 Type:         ${isAtlas ? 'MongoDB Atlas (Cloud Cluster)' : 'Local / Custom MongoDB'}`);
  console.log(`⏳ Attempting connection...`);

  try {
    const conn = await connectDB();
    console.log(`\n✅ Connected successfully!`);
    console.log(`   Host:     ${conn.host}`);
    console.log(`   Port:     ${conn.port || 'Default (SRV)'}`);
    console.log(`   Database: ${conn.name}`);
    console.log(`   State:    Ready (code ${conn.readyState})`);

    // Ping check
    if (conn.db) {
      const pingResult = await conn.db.admin().ping();
      console.log(`   Ping:     OK (${JSON.stringify(pingResult)})`);

      // Read collection statistics
      const [userCount, serviceCount] = await Promise.all([
        User.countDocuments().catch(() => 0),
        Service.countDocuments().catch(() => 0),
      ]);

      console.log(`\n📊 Database Collection Status:`);
      console.log(`   • Users:             ${userCount}`);
      console.log(`   • Service Categories: ${serviceCount}`);

      const collections = await conn.db.listCollections().toArray();
      console.log(`   • Total Collections:  ${collections.length} (${collections.map(c => c.name).join(', ') || 'none yet'})`);
    }

    console.log('\n🎉 Atlas connection test PASSED! Your backend is ready to use MongoDB Atlas.');
    console.log('================================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Failed to connect to MongoDB:`);
    console.error(`   Error: ${error.message}\n`);

    if (isAtlas) {
      console.log('🔧 Atlas Troubleshooting Checklist:');
      console.log('   1. IP Whitelist: Go to Atlas -> "Network Access" -> ensure your current IP');
      console.log('      is listed, or temporarily add 0.0.0.0/0 (allow from anywhere) to test.');
      console.log('   2. Database User: Ensure the username and password match a user created');
      console.log('      in Atlas -> "Database Access".');
      console.log('   3. Password Characters: If your password has special characters, encode them.');
      console.log('   4. Cluster State: Ensure your Atlas cluster is not paused or updating.');
    }
    console.log('================================================================\n');
    process.exit(1);
  }
};

runDbVerification();
