const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

console.log('🚀 Setting up environment variables for Friendly App\n');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Please add these variables manually:\n');
} else {
  console.log('📝 Creating .env.local file...\n');
}

console.log('Please add the following to your .env.local file:\n');
console.log('OPENAI_API_KEY=your_openai_api_key_here');
console.log('NEXT_PUBLIC_MAPBOX_API_KEY=your_mapbox_token_here\n');

console.log('🔑 To get your API keys:');
console.log('1. OpenAI API Key: https://platform.openai.com/api-keys');
console.log('2. Mapbox Token: https://account.mapbox.com/access-tokens/\n');

console.log('📋 Instructions:');
console.log('1. Copy the lines above');
console.log('2. Replace "your_openai_api_key_here" with your actual OpenAI API key');
console.log('3. Replace "your_mapbox_token_here" with your actual Mapbox token');
console.log('4. Save the file as .env.local in your project root\n');

console.log('✅ After setting up the environment variables, run: npm run dev'); 