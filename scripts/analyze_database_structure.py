#!/usr/bin/env python3
"""
Analyze database structure and RLS policies
"""

import os
import sys
from pathlib import Path

# Load environment variables from .env.local
def load_env_file():
    env_file = Path(__file__).parent.parent / '.env.local'
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

load_env_file()

from supabase import create_client

# Use service role key to analyze database structure
supabase_service = create_client(
    os.getenv('EXPO_PUBLIC_SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Use anon key to test permissions
supabase_anon = create_client(
    os.getenv('EXPO_PUBLIC_SUPABASE_URL'),
    os.getenv('EXPO_PUBLIC_SUPABASE_ANON_KEY')
)

def test_table_access(table_name, description):
    """Test if anonymous user can access a table"""
    
    print(f"🧪 Testing {description} ({table_name})")
    
    # Test with service role (should work)
    try:
        service_result = supabase_service.table(table_name).select('*').limit(1).execute()
        print(f"   ✅ Service role access: OK ({len(service_result.data)} rows)")
    except Exception as e:
        print(f"   ❌ Service role access: FAILED - {e}")
    
    # Test with anonymous key (might fail)
    try:
        anon_result = supabase_anon.table(table_name).select('*').limit(1).execute()
        print(f"   ✅ Anonymous access: OK ({len(anon_result.data)} rows)")
        return True
    except Exception as e:
        print(f"   ❌ Anonymous access: FAILED - {e}")
        return False

def main():
    print("🔍 Analyzing Database Structure & RLS Policies")
    print("=" * 60)
    
    # Known tables based on your schema
    tables_to_test = [
        ('episodes', 'Episodes table'),
        ('segments', 'Segments table'),
        ('episode_segments', 'Episode segments table (if exists)'),
    ]
    
    access_results = {}
    
    for table_name, description in tables_to_test:
        print()
        access_results[table_name] = test_table_access(table_name, description)
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    
    tables_needing_rls = []
    
    for table_name, can_access in access_results.items():
        if can_access:
            print(f"✅ {table_name}: Anonymous access already works")
        else:
            print(f"❌ {table_name}: Needs RLS policies")
            tables_needing_rls.append(table_name)
    
    print(f"\n📋 Tables needing RLS setup: {len(tables_needing_rls)}")
    for table in tables_needing_rls:
        print(f"   - {table}")
    
    if tables_needing_rls:
        print(f"\n🚀 Next step: Create RLS policies for these tables")
    else:
        print(f"\n🎉 All tables already have proper anonymous access!")

if __name__ == "__main__":
    main() 