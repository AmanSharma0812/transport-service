const { exec } = require('child_process');
const fs = require('fs');

// Generate a MongoDB connection string that works with mongosh/mongod
const connectionString = 'mongodb+srv://humptysharma869281_db_user:Aman_123@cluster0.5fvtauc.mongodb.net/quickride?retryWrites=true&w=majority';

console.log('Testing using MongoDB shell command...');
console.log('Command: mongosh "' + connectionString + '"');
console.log('\nIf this fails, we need to check:');
console.log('1. mongosh is installed? (MongoDB Shell)');
console.log('2. Network can resolve DNS SRV records');
console.log('3. Firewall allows outbound 27017');

// Also check DNS resolution
const dns = require('dns');
dns.resolveSrv('_mongodb._tcp.cluster0.5fvtauc.mongodb.net', (err, addresses) => {
  if (err) {
    console.log('\n❌ DNS SRV resolution failed:', err.message);
    console.log('This means your network/DNS cannot find MongoDB Atlas servers.');
    console.log('Possible causes:');
    console.log('  - Corporate firewall blocking');
    console.log('  - Antivirus blocking');
    console.log('  - DNS server not supporting SRV');
  } else {
    console.log('\n✅ DNS SRV resolved successfully!');
    console.log('Found servers:', addresses.map(a => a.name).join(', '));
  }
});