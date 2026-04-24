const mongoose = require('mongoose');

// Try multiple connection string formats
const uris = [
  // SRV format (simplest)
  'mongodb+srv://humptysharma869281_db_user:Aman_123@cluster0.5fvtauc.mongodb.net/quickride?retryWrites=true&w=majority',
  
  // Non-SRV with all shards
  'mongodb://humptysharma869281_db_user:Aman_123@cluster0-shard-00-00.5fvtauc.mongodb.net:27017,cluster0-shard-00-01.5fvtauc.mongodb.net:27017,cluster0-shard-00-02.5fvtauc.mongodb.net:27017/quickride?ssl=true&replicaSet=atlas-5fvtauc-shard-0&authSource=admin&retryWrites=true&w=majority'
];

async function testConnections() {
  for (let i = 0; i < uris.length; i++) {
    console.log(`\n🔍 Testing connection ${i + 1}/${uris.length}...`);
    console.log(`URI: ${uris[i].substring(0, 60)}...`);
    
    try {
      await mongoose.connect(uris[i], {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 15000
      });
      console.log('✅ SUCCESS! Connected to MongoDB Atlas!');
      console.log('   Database:', mongoose.connection.name);
      console.log('   Host:', mongoose.connection.host);
      process.exit(0);
    } catch (err) {
      console.log('❌ Failed:', err.message);
      if (i < uris.length - 1) {
        console.log('   Trying next option...');
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('❌ All connection attempts failed');
  console.log('='.repeat(60));
  console.log('\n🔧 Troubleshooting Checklist:');
  console.log('1. ☑️ Cluster is ACTIVE (not paused) in Atlas');
  console.log('2. ☑️ IP whitelist includes your IP (0.0.0.0/0 for testing)');
  console.log('3. ☑️ Username: humptysharma869281_db_user');
  console.log('4. ☑️ Password: Aman_123 (case-sensitive)');
  console.log('5. ☑️ Database "quickride" exists or will be created');
  console.log('\n📍 How to fix:');
  console.log('   → Go to https://cloud.mongodb.com');
  console.log('   → Security → Network Access → Add IP 0.0.0.0/0');
  console.log('   → Wait 30 seconds, then retry');
  process.exit(1);
}

testConnections();