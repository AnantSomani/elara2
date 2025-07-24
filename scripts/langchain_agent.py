import os
from dotenv import load_dotenv
load_dotenv()
from langchain_openai import OpenAI

def main():
    # Load OpenAI API key from environment
    openai_api_key = os.environ.get("EXPO_PUBLIC_OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("Missing EXPO_PUBLIC_OPENAI_API_KEY in environment variables.")

    # Create a simple LangChain LLM instance
    llm = OpenAI(openai_api_key=openai_api_key, temperature=0.7)

    # Prompt user for input
    user_prompt = input("Enter a prompt for the LLM: ")

    # Run the LLM
    response = llm(user_prompt)
    print("LLM Response:", response)

if __name__ == "__main__":
    main() 