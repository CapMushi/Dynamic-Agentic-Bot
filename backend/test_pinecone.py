import os
from dotenv import load_dotenv
from pinecone import Pinecone

# Load environment variables from .env
load_dotenv()

api_key = os.getenv("PINECONE_API_KEY")
environment = os.getenv("PINECONE_ENVIRONMENT")
index_name = os.getenv("PINECONE_INDEX_NAME")

print("API Key (first 8 chars):", api_key[:8] if api_key else None)
print("Environment:", environment)
print("Index Name:", index_name)

# Initialize Pinecone using new API (version 7.3.0)
pc = Pinecone(api_key=api_key)

try:
    indexes = pc.list_indexes()
    print("Indexes from API:", [index.name for index in indexes])
    index_names = [index.name for index in indexes]
except Exception as e:
    print("Error listing indexes:", e)
    index_names = []

if index_name and index_name not in index_names:
    print(f"WARNING: Index '{index_name}' is not visible via API, but you see it in the dashboard.")
    print("Possible causes:")
    print("- API key is from a different project than your dashboard view")
    print("- Environment/region mismatch")
    print("- Index is new and not yet propagated (wait a few minutes)")
    print("- Permissions issue with API key")
else:
    print(f"Index '{index_name}' is accessible via API.")
    
    # Try to connect to the index
    try:
        index = pc.Index(index_name)
        stats = index.describe_index_stats()
        print(f"Index stats: {stats}")
    except Exception as e:
        print(f"Error connecting to index: {e}") 