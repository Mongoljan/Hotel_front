#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

console.log('🔐 Setting up authentication system...\n');

// Generate AUTH_SECRET
const authSecret = crypto.randomBytes(32).toString('base64');

// Create .env.local if it doesn't exist
const envPath = path.join(process.cwd(), '.env.local');
const envContent = `# Authentication
AUTH_SECRET=${authSecret}

# API Configuration
NEXT_PUBLIC_API_URL=https://dev.kacc.mn/api

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${authSecret}

# Development
NODE_ENV=development
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local with authentication configuration');
} else {
  console.log('⚠️  .env.local already exists. Please ensure AUTH_SECRET is set.');
}

console.log('\n📋 Environment variables to check:');
console.log('- AUTH_SECRET: Required for session encryption');
console.log('- NEXT_PUBLIC_API_URL: API endpoint (defaults to https://dev.kacc.mn/api)');
console.log('- NEXTAUTH_URL: Your application URL (defaults to http://localhost:3000)');

console.log('\n🚀 Next steps:');
console.log('1. Review and update .env.local if needed');
console.log('2. Restart your development server');
console.log('3. Test the authentication flow');
console.log('4. Check the documentation at docs/AUTHENTICATION.md');

console.log('\n✨ Authentication system setup complete!'); 