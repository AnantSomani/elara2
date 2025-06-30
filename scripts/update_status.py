#!/usr/bin/env python3
"""
Update episode processing status in Supabase
"""

import os
import sys
import argparse
from supabase import create_client, Client

def update_status(episode_id: str, status: str):
    """Update the processing status of an episode"""
    try:
        supabase: Client = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )
        
        result = supabase.table('episodes').update({
            'processing_status': status
        }).eq('id', episode_id).execute()
        
        print(f"Successfully updated episode {episode_id} status to {status}")
        return True
        
    except Exception as e:
        print(f"Error updating status: {e}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description='Update episode processing status')
    parser.add_argument('--episode-id', required=True, help='Episode ID')
    parser.add_argument('--status', required=True, choices=['pending', 'processing', 'completed', 'failed'], help='New status')
    
    args = parser.parse_args()
    
    success = update_status(args.episode_id, args.status)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 