import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Template from '../models/Template.js';

dotenv.config();
await connectDB();

const passwordHash = await bcrypt.hash('admin123', 12);
await User.findOneAndUpdate(
  { email: 'admin@layr.com' },
  { name: 'LAYR Admin', email: 'admin@layr.com', passwordHash, role: 'admin' },
  { upsert: true }
);

const templates = [
  {
    name: 'Northstar Studio', slug: 'northstar-studio',
    category: 'portfolio', description: 'Bold layouts for creative people.',
    price: 48, techStack: 'HTML / CSS',
    filePath: 'private/templates/northstar.zip', fileName: 'northstar-studio.zip'
  },
  {
    name: 'Sunday Ritual', slug: 'sunday-ritual',
    category: 'online-store', description: 'A warm welcome for your next shop.',
    price: 64, techStack: 'HTML / CSS',
    filePath: 'private/templates/sunday.zip', fileName: 'sunday-ritual.zip'
  },
  {
    name: 'Orbit Launchpad', slug: 'orbit-launchpad',
    category: 'landing-page', description: 'Launch your product with clarity.',
    price: 39, techStack: 'HTML / CSS',
    filePath: 'private/templates/orbit.zip', fileName: 'orbit-launchpad.zip'
  }
];

for (const t of templates) {
  await Template.findOneAndUpdate({ slug: t.slug }, t, { upsert: true });
}

console.log('Seeded admin (admin@layr.com / admin123) and 3 templates');
await mongoose.disconnect();
