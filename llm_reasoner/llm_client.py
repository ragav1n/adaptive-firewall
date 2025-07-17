# llm_reasoner/llm_client.py
import subprocess

def query_model(user_input, model="llama3:8b", system_prompt=None):
    import ollama

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_input})

    response = ollama.chat(model=model, messages=messages)
    return response['message']['content'].strip()

