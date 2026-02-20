
import ollama
import sys

print("Testing direct Ollama connection...")
try:
    response = ollama.chat(model='phi3:mini', messages=[
        {'role': 'user', 'content': 'Hello, are you working?'}
    ])
    print("Success!")
    print(response['message']['content'])
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
