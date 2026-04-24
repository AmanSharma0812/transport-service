const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  const connect = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickride', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('MongoDB Connected...');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      throw err;
    }
  };

  for (let i = 0; i < retries; i++) {
    try {
      await connect();
      return;
    } catch (err) {
      if (i === retries - 1) {
        console.error('Max retries reached. Could not connect to MongoDB.');
        process.exit(1);
      }
      console.log(`Retrying connection... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectDB;