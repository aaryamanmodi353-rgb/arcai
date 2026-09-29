require('dotenv').config({ path: 'c:\\Users\\aarya\\Downloads\\masalAIassessment\\.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  let admin = await User.findOne({ role: 'admin' });
  if (admin) {
    console.log("Admin exists:");
    console.log(`Email: ${admin.email}`);
  } else {
    const passwordHash = await bcrypt.hash('admin123', 10);
    admin = await User.create({
      name: 'Agent Arc',
      email: 'admin@arc.com',
      passwordHash,
      role: 'admin'
    });
    console.log("Created default admin!");
    console.log(`Email: admin@arc.com`);
    console.log(`Password: admin123`);
  }
  process.exit(0);
}

run();
