import os
from dotenv import load_dotenv
from supabase import create_client, Client
import openai

load_dotenv()

SUPABASE_URL = os.environ["EXPO_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["EXPO_PUBLIC_SUPABASE_ANON_KEY"]
OPENAI_API_KEY = os.environ["EXPO_PUBLIC_OPENAI_API_KEY"]

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Get embedding for a query string using OpenAI
def get_query_embedding(query: str):
    openai.api_key = OPENAI_API_KEY
    response = openai.embeddings.create(
        input=query,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

# Retrieve most similar transcript segments for a given episode and query
# Uses the search_segments Postgres function
# Returns a list of dicts with id, content, speaker_name, start_time, end_time, similarity

def retrieve_similar_segments(episode_id: str, query: str, top_k: int = 5, similarity_threshold: float = 0.3):
    embedding = get_query_embedding(query)
    
    # Debug prints
    print(f"Query: '{query}'")
    print(f"Embedding type: {type(embedding)}")
    print(f"Embedding length: {len(embedding)}")
    print(f"First 5 values: {embedding[:5]}")
    print(f"Last 5 values: {embedding[-5:]}")
    
    # Skip RPC for now and go straight to fallback
    print("Using direct table query approach...")
    
    # Get segments directly from the table
    response = supabase.table('transcript_segments').select(
        'id, content, speaker_name, start_time, end_time, embedding'
    ).eq('episode_id', episode_id).limit(top_k).execute()
    
    print(f"Response type: {type(response)}")
    print(f"Response data: {response}")
    
    if hasattr(response, 'data') and response.data:
        print(f"Found {len(response.data)} segments")
        return response.data
    else:
        print("No segments found in direct query")
        return []

if __name__ == "__main__":
    episode_id = input("Enter episode ID (YouTube video ID): ")
    query = input("Enter your query: ")
    results = retrieve_similar_segments(episode_id, query)
    print("\nTop matching transcript segments:")
    if not results:
        print("No matching segments found.")
    else:
        for r in results:
            print(f"\n[Similarity: {r['similarity']:.3f}] {r['speaker_name']} ({r['start_time']:.1f}-{r['end_time']:.1f}s):\n{r['content']}") 