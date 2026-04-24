const { MongoClient } = require('mongodb');

const uri = "mongodb://humptysharma869281_db_user:Aman_123@cluster0-shard-00-00.5fvtauc.mongodb.net:27017,cluster0-shard-00-01.5fvtauc.mongodb.net:27017,cluster0-shard-00-02.5fvtauc.mongodb.net:27017/quickride?ssl=true&replicaSet=atlas-5fvtauc-shard-0&authSource=admin&retryWrites=true&w=majority";

console.log("Attempting to connect with standard connection string...");
console.log("URI (with password masked):", uri.replace(/:[^:@]+@/g, ":****@"));

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000
});

async function run() {
  try {
    await client.connect();
    console.log("✅ SUCCESS: Connected to MongoDB Atlas using standard connection string!");
    
    // List databases to verify
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log("Databases:", dbs.databases.map(d => d.name).join(', '));
    
    await client.close();
    return true;
  } catch (err) {
    console.error("❌ FAILED: Connection error:");
    console.error(err);
    return false;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close().catch(() => {});
  }
}

run().then(success => {
  process.exit(success ? 0 : 1);
});