#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Development settings
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created successfully!');
  console.log('📝 Content:');
  console.log(envContent);
  console.log('\n🚀 You can now start the development server with: npm run dev');
} catch (error) {
  console.error('❌ Error creating .env.local file:', error.message);
  console.log('\n📋 Please create .env.local manually with the following content:');
  console.log(envContent);
}

