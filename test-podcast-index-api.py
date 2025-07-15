#!/usr/bin/env python3
"""
Test script for Podcast Index API endpoint
"""

import argparse
import asyncio
import requests
import json
import time
from datetime import datetime

# API base URL (adjust if your server runs on different port)
API_BASE_URL = "http://localhost:8000"

def parse_args():
    parser = argparse.ArgumentParser(description="Test Podcast Index API endpoint with real episode data.")
    parser.add_argument('--guid', required=True, help='Podcast Index episode GUID')
    parser.add_argument('--enclosure_url', required=True, help='Direct audio URL (enclosure)')
    parser.add_argument('--title', required=True, help='Episode title')
    parser.add_argument('--description', default='', help='Episode description')
    parser.add_argument('--duration', type=int, default=1800, help='Duration in seconds (default: 1800)')
    parser.add_argument('--pub_date', default=None, help='Publication date (ISO format)')
    parser.add_argument('--image_url', default=None, help='Image URL')
    parser.add_argument('--podcast_title', default=None, help='Podcast title')
    parser.add_argument('--episode_type', default='full', help='Episode type (default: full)')
    parser.add_argument('--explicit', action='store_true', help='Mark as explicit')
    parser.add_argument('--force_reprocess', action='store_true', help='Force reprocessing even if already processed')
    return parser.parse_args()

def test_podcast_index_endpoint(args):
    """Test the new Podcast Index processing endpoint"""
    print("🧪 Testing Podcast Index API Endpoint")
    print("=" * 50)

    # Build episode data from args
    episode_data = {
        "guid": args.guid,
        "enclosureUrl": args.enclosure_url,
        "title": args.title,
        "description": args.description,
        "duration": args.duration,
        "pubDate": args.pub_date,
        "imageUrl": args.image_url,
        "podcastTitle": args.podcast_title,
        "episodeType": args.episode_type,
        "explicit": args.explicit
    }

    request_data = {
        "episode_data": episode_data,
        "episode_id": None,  # Let the API generate one
        "force_reprocess": args.force_reprocess
    }

    try:
        print(f"📡 Sending request to: {API_BASE_URL}/process-podcast-index")
        print(f"📋 Episode data: {episode_data['title']} (GUID: {episode_data['guid']})")
        print()

        # Send POST request to the new endpoint
        response = requests.post(
            f"{API_BASE_URL}/process-podcast-index",
            json=request_data,
            headers={"Content-Type": "application/json"}
        )

        print(f"📊 Response Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("✅ Success! Response:")
            print(f"   Episode ID: {result['episode_id']}")
            print(f"   Status: {result['status']}")
            print(f"   Message: {result['message']}")
            print(f"   Started At: {result['started_at']}")

            # Test status polling
            episode_id = result['episode_id']
            print(f"\n🔄 Testing status polling for episode: {episode_id}")

            max_attempts = 10
            for attempt in range(max_attempts):
                time.sleep(2)  # Wait 2 seconds between checks

                status_response = requests.get(f"{API_BASE_URL}/status/{episode_id}")
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    print(f"   Attempt {attempt + 1}: {status_data['processing_status']}")

                    if status_data['processing_status'] == 'completed':
                        print("🎉 Processing completed successfully!")
                        break
                    elif status_data['processing_status'] == 'failed':
                        print(f"❌ Processing failed: {status_data.get('error_message', 'Unknown error')}")
                        break
                else:
                    print(f"   Attempt {attempt + 1}: Failed to get status")

        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")

    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the FastAPI server is running on localhost:8000")
        print("   Start it with: ./start-processing-api.sh")
    except Exception as e:
        print(f"❌ Test failed: {e}")

def test_api_health():
    """Test if the API is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            print("✅ API is healthy and running")
            return True
        else:
            print(f"❌ API health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API - server not running")
        return False

def test_api_endpoints():
    """Test if the new endpoint is listed in the API docs"""
    try:
        response = requests.get(f"{API_BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            endpoints = data.get('endpoints', {})

            if 'process-podcast-index' in endpoints:
                print("✅ Podcast Index endpoint is listed in API docs")
                print(f"   Endpoint: {endpoints['process-podcast-index']}")
            else:
                print("❌ Podcast Index endpoint not found in API docs")
                print(f"   Available endpoints: {list(endpoints.keys())}")
        else:
            print(f"❌ Failed to get API docs: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing API endpoints: {e}")

if __name__ == "__main__":
    print("🚀 Podcast Index API Test")
    print("=" * 50)

    args = parse_args()

    # Test 1: Check if API is running
    print("\n1️⃣ Testing API Health...")
    if not test_api_health():
        print("❌ API is not running. Please start it first:")
        print("   ./start-processing-api.sh")
        exit(1)

    # Test 2: Check if new endpoint is available
    print("\n2️⃣ Testing API Endpoints...")
    test_api_endpoints()

    # Test 3: Test the actual Podcast Index endpoint
    print("\n3️⃣ Testing Podcast Index Processing...")
    test_podcast_index_endpoint(args)

    print("\n🎯 Test completed!") 