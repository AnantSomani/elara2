#!/usr/bin/env python3
"""
Test Hugging Face authentication and pyannote model access
Run: python scripts/test_huggingface.py
"""

import os
import sys

def test_huggingface_auth():
    print("🔍 Testing Hugging Face authentication...\n")
    
    # Check if token is available
    token = os.getenv('HUGGINGFACE_TOKEN') or os.getenv('HF_TOKEN')
    
    if not token:
        print("❌ No Hugging Face token found in environment variables")
        print("   Set HUGGINGFACE_TOKEN environment variable")
        print("   Or run: export HUGGINGFACE_TOKEN=your_token_here")
        return False
    
    print(f"✅ Token found: {token[:8]}...")
    
    # Test token validity
    try:
        import requests
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get("https://huggingface.co/api/whoami", headers=headers)
        
        if response.status_code == 200:
            user_info = response.json()
            print(f"✅ Token is valid for user: {user_info.get('name', 'Unknown')}")
        else:
            print(f"❌ Token validation failed: {response.status_code}")
            return False
            
    except ImportError:
        print("⚠️  requests not available, skipping token validation")
    except Exception as e:
        print(f"❌ Error validating token: {e}")
        return False
    
    # Test pyannote model access
    print("\n🎙️ Testing pyannote model access...")
    
    try:
        from pyannote.audio import Pipeline
        
        # Try to load the diarization pipeline
        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=token
        )
        
        print("✅ Successfully loaded pyannote speaker diarization model!")
        print("   You have access to speaker diarization features")
        
        return True
        
    except ImportError:
        print("❌ pyannote.audio not installed")
        print("   Install with: pip install pyannote.audio")
        return False
        
    except Exception as e:
        error_msg = str(e)
        
        if "gated repo" in error_msg.lower() or "access" in error_msg.lower():
            print("❌ Access denied to pyannote model")
            print("   Go to: https://huggingface.co/pyannote/speaker-diarization-3.1")
            print("   Click 'Agree and access repository'")
            
        elif "authentication" in error_msg.lower():
            print("❌ Authentication failed")
            print("   Check your token permissions")
            
        else:
            print(f"❌ Error loading model: {e}")
            
        return False

def main():
    success = test_huggingface_auth()
    
    if success:
        print("\n🎉 All tests passed! Your Hugging Face setup is ready.")
        print("\n🎯 Next steps:")
        print("1. Add HUGGINGFACE_TOKEN to your GitHub repository secrets")
        print("2. Test the complete background processing pipeline")
    else:
        print("\n🚨 Setup incomplete. Please fix the issues above.")
        
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main()) 