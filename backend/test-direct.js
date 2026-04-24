const { MongoClient } = require('mongodb');

// Test with the simplest possible connection
async function testDirectConnection() {
  const uri = "mongodb+srv://humptysharma869281_db_user:Aman_123@cluster0.5fvtauc.mongodb.net/quickride?retryWrites=true&w=majority";
  
  console.log("Testing direct MongoDB connection...");
  console.log("URI:", uri.replace(/:[^:@]+@/g, ":****@")); // Hide password in log
  
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000
  });
  
  try {
    await client.connect();
    console.log("✅ SUCCESS: Direct MongoDB connection works!");
    
    // List databases
    const dbs = await client.db().admin().listDatabases();
    console.log("Databases:", dbs.databases.map(d => d.name));
    
    await client.close();
    return true;
  } catch (err) {
    console.error("❌ FAILED: Direct MongoDB connection failed:");
    console.error("Error:", err.message);
    console.error("Error name:", err.name);
    if (err.errorLabels) {
      console.log("Error labels:", err.errorLabels);
    }
    return false;
  }
}

testDirectConnection().then(success => {
  process.exit(success ? 0 : 1);
});