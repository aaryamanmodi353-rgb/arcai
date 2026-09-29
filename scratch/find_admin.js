require('dotenv').config({ path: 'c:\\Users\\aarya\\Downloads\\masalAIassessment\\.env.local' });
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    console.log("Found existing admin:");
    console.log(`Email: ${existingAdmin.email}`);
    console.log(`(Password is what you used during sign up)`);
  } else {
    console.log("No admin found!");
  }
  process.exit(0);
}

run();
