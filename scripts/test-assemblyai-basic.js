#!/usr/bin/env node
/**
 * Basic AssemblyAI Connection and Functionality Test
 * Tests API connectivity, transcription capability, and database integration
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables from multiple sources
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Helper function to get environment variable with correct mappings
function getEnvVar(name) {
    // Map the standard names to actual environment variable names
    const envMapping = {
        'SUPABASE_URL': process.env.EXPO_PUBLIC_SUPABASE_URL,
        'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
        'ASSEMBLYAI_API_KEY': process.env.ASSEMBLYAI_API_KEY
    };
    
    return envMapping[name] || process.env[name];
}

// Test configuration
const TEST_AUDIO_URL = 'https://github.com/AssemblyAI-Examples/audio-examples/raw/main/20220519_c_0030.mp3'; // Short sample audio

// Generate a proper UUID for testing
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const TEST_EPISODE_ID = generateUUID();

async function testAssemblyAIConnectivity() {
    console.log('🔍 Testing AssemblyAI API connectivity...');
    
    try {
        const response = await fetch('https://api.assemblyai.com/v2/transcript', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getEnvVar('ASSEMBLYAI_API_KEY')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                audio_url: TEST_AUDIO_URL,
                speaker_labels: true
            })
        });
        
        if (!response.ok) {
            throw new Error(`AssemblyAI API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ AssemblyAI API connectivity: SUCCESS');
        console.log(`   Transcript ID: ${data.id}`);
        console.log(`   Status: ${data.status}`);
        
        return data.id;
    } catch (error) {
        console.error('❌ AssemblyAI API connectivity: FAILED');
        console.error(`   Error: ${error.message}`);
        throw error;
    }
}

async function testSupabaseConnectivity() {
    console.log('🔍 Testing Supabase database connectivity...');
    
    try {
        const supabase = createClient(
            getEnvVar('SUPABASE_URL'),
            getEnvVar('SUPABASE_SERVICE_KEY')
        );
        
        // Test basic connection with a simple query
        const { data, error } = await supabase
            .from('episodes')
            .select('id')
            .limit(1);
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Supabase connectivity: SUCCESS');
        console.log(`   Database accessible, episodes table found`);
        
        return supabase;
    } catch (error) {
        console.error('❌ Supabase connectivity: FAILED');
        console.error(`   Error: ${error.message}`);
        throw error;
    }
}

async function testDatabaseSchema() {
    console.log('🔍 Testing database schema (new AssemblyAI columns)...');
    
    try {
        const supabase = createClient(
            getEnvVar('SUPABASE_URL'),
            getEnvVar('SUPABASE_SERVICE_KEY')
        );
        
        // Test inserting a dummy episode with new schema
        const testEpisode = {
            id: TEST_EPISODE_ID,
            title: 'AssemblyAI Test Episode',
            processing_status: 'pending',
            assemblyai_status: 'pending',
            speakers: ['Speaker_A', 'Speaker_B'],
            episode_chapters: [],
            detected_entities: [],
            processing_metadata: {
                test: true,
                created_at: new Date().toISOString()
            }
        };
        
        const { data, error } = await supabase
            .from('episodes')
            .insert(testEpisode)
            .select();
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Database schema: SUCCESS');
        console.log(`   New AssemblyAI columns accessible`);
        console.log(`   Test episode inserted: ${TEST_EPISODE_ID}`);
        
        // Clean up test episode
        await supabase
            .from('episodes')
            .delete()
            .eq('id', TEST_EPISODE_ID);
        
        console.log('   Test episode cleaned up');
        
        return true;
    } catch (error) {
        console.error('❌ Database schema: FAILED');
        console.error(`   Error: ${error.message}`);
        console.log('   💡 Make sure you ran the database migrations!');
        throw error;
    }
}

async function testOpenAIConnectivity() {
    console.log('🔍 Testing OpenAI API connectivity...');
    
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${getEnvVar('OPENAI_API_KEY')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const hasEmbeddingModel = data.data.some(model => 
            model.id.includes('text-embedding-3-small')
        );
        
        console.log('✅ OpenAI API connectivity: SUCCESS');
        console.log(`   Embedding model available: ${hasEmbeddingModel ? 'YES' : 'NO'}`);
        
        return true;
    } catch (error) {
        console.error('❌ OpenAI API connectivity: FAILED');
        console.error(`   Error: ${error.message}`);
        throw error;
    }
}

async function checkEnvironmentVariables() {
    console.log('🔍 Checking environment variables...');
    
    const requiredVars = [
        'ASSEMBLYAI_API_KEY',
        'OPENAI_API_KEY',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_KEY'
    ];
    
    const missing = requiredVars.filter(varName => !getEnvVar(varName));
    
    if (missing.length > 0) {
        console.error('❌ Environment variables: FAILED');
        console.error(`   Missing: ${missing.join(', ')}`);
        console.log('   💡 Current mappings:');
        requiredVars.forEach(varName => {
            const value = getEnvVar(varName);
            console.log(`   ${varName}: ${value ? '✅ Found' : '❌ Missing'}`);
        });
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    console.log('✅ Environment variables: SUCCESS');
    console.log(`   All required variables present`);
    return true;
}

async function testProcessingLogs() {
    console.log('🔍 Testing processing_logs table...');
    
    try {
        const supabase = createClient(
            getEnvVar('SUPABASE_URL'),
            getEnvVar('SUPABASE_SERVICE_KEY')
        );
        
        // Create a temporary episode for the logs test
        const logTestEpisodeId = generateUUID();
        const tempEpisode = {
            id: logTestEpisodeId,
            title: 'Processing Logs Test Episode',
            processing_status: 'pending'
        };
        
        await supabase.from('episodes').insert(tempEpisode);
        
        // Test inserting a log entry
        const testLog = {
            episode_id: logTestEpisodeId,
            processing_type: 'connectivity_test',
            status: 'completed',
            metadata: {
                test: true,
                timestamp: new Date().toISOString()
            }
        };
        
        const { data, error } = await supabase
            .from('processing_logs')
            .insert(testLog)
            .select();
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Processing logs table: SUCCESS');
        console.log(`   Log entry created successfully`);
        
        // Clean up test log and episode
        await supabase
            .from('processing_logs')
            .delete()
            .eq('episode_id', logTestEpisodeId);
            
        await supabase
            .from('episodes')
            .delete()
            .eq('id', logTestEpisodeId);
        
        console.log('   Test data cleaned up');
        
        return true;
    } catch (error) {
        console.error('❌ Processing logs table: FAILED');
        console.error(`   Error: ${error.message}`);
        throw error;
    }
}

async function runFullTest() {
    console.log('🚀 Starting AssemblyAI Integration Test Suite\n');
    
    try {
        // Test 1: Environment Variables
        await checkEnvironmentVariables();
        console.log('');
        
        // Test 2: Supabase Connectivity
        await testSupabaseConnectivity();
        console.log('');
        
        // Test 3: Database Schema
        await testDatabaseSchema();
        console.log('');
        
        // Test 4: Processing Logs
        await testProcessingLogs();
        console.log('');
        
        // Test 5: AssemblyAI Connectivity
        await testAssemblyAIConnectivity();
        console.log('');
        
        // Test 6: OpenAI Connectivity
        await testOpenAIConnectivity();
        console.log('');
        
        console.log('🎉 ALL TESTS PASSED!');
        console.log('✅ System ready for AssemblyAI podcast processing');
        console.log('\n📝 Next steps:');
        console.log('   1. Try processing a real episode:');
        console.log(`   python scripts/process_podcast.py --url "YOUTUBE_URL" --episode-id "episode-001"`);
        console.log('   2. Monitor the processing_logs table for detailed status');
        
    } catch (error) {
        console.error('\n💥 TEST SUITE FAILED');
        console.error(`❌ Error: ${error.message}`);
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Check your .env.local file has all required API keys');
        console.error('   2. Verify database migrations were applied successfully');
        console.error('   3. Test API keys individually in their respective dashboards');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runFullTest();
}

module.exports = {
    testAssemblyAIConnectivity,
    testSupabaseConnectivity,
    testDatabaseSchema,
    testOpenAIConnectivity,
    checkEnvironmentVariables,
    testProcessingLogs
}; 