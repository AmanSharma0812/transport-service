const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://humptysharma869281_db_user:Aman_123@cluster0-shard-00-00.5fvtauc.mongodb.net:27017,cluster0-shard-00-01.5fvtauc.mongodb.net:27017,cluster0-shard-00-02.5fvtauc.mongodb.net:27017/quickride?ssl=true&replicaSet=atlas-5fvtauc-shard-0&authSource=admin&retryWrites=true&w=majority';

console.log('Testing MongoDB Atlas connection...');

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas successfully!');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  console.error('\nTroubleshooting tips:');
  console.error('1. Check your cluster is running in MongoDB Atlas');
  console.error('2. Ensure IP whitelist includes your IP (0.0.0.0/0 for all)');
  console.error('3. Verify username/password are correct');
  console.error('4. Check network/firewall settings');
  process.exit(1);
});