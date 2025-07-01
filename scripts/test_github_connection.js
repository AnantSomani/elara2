#!/usr/bin/env node
/**
 * Test script to verify GitHub repository connection
 * Run: node scripts/test_github_connection.js
 */

const REPO_OWNER = 'AnantSomani';
const REPO_NAME = 'elara2';

async function testConnection() {
  console.log('🔍 Testing GitHub repository connection...\n');
  
  // Test 1: Public API access
  console.log('1. Testing public repository access...');
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Repository is accessible!');
      console.log(`   Name: ${data.name}`);
      console.log(`   Private: ${data.private}`);
      console.log(`   URL: ${data.html_url}`);
    } else {
      console.log('❌ Repository not accessible via public API');
      console.log(`   Status: ${response.status}`);
      console.log(`   This usually means the repository is private`);
    }
  } catch (error) {
    console.log('❌ Error accessing repository:', error.message);
  }
  
  // Test 2: Check if GitHub token is configured
  console.log('\n2. Testing GitHub token configuration...');
  const token = process.env.EXPO_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.log('❌ No GitHub token found in environment variables');
    console.log('   Add EXPO_PUBLIC_GITHUB_TOKEN to your .env file');
  } else {
    console.log('✅ GitHub token is configured');
    
    // Test authenticated access
    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (response.ok) {
        console.log('✅ Authenticated access successful!');
      } else {
        console.log('❌ Authenticated access failed');
        console.log(`   Status: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Error with authenticated access:', error.message);
    }
  }
  
  // Test 3: Check repository structure
  console.log('\n3. Checking local repository configuration...');
  
  try {
    const { execSync } = require('child_process');
    
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    console.log('✅ Git remote configured:', remoteUrl);
    
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log('✅ Current branch:', currentBranch);
    
    // Check if workflow file exists
    const fs = require('fs');
    if (fs.existsSync('.github/workflows/podcast-processing.yml')) {
      console.log('✅ GitHub Actions workflow file found');
    } else {
      console.log('❌ GitHub Actions workflow file missing');
    }
    
  } catch (error) {
    console.log('❌ Error checking local configuration:', error.message);
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Make sure your repository is public OR configure private access');
  console.log('2. Add GitHub secrets to your repository settings');
  console.log('3. Configure EXPO_PUBLIC_GITHUB_TOKEN in your .env file');
  console.log('\nFor detailed setup: see BACKGROUND_AGENTS_SETUP.md');
}

testConnection().catch(console.error); 