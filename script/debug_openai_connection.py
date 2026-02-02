# script/debug_openai_connection.py
import openai
import os
import sys
import traceback # For detailed exception info
import urllib.request # For basic HTTPS test
import ssl # For SSL context info
import httpx # For direct httpx test
import json # For printing environment variables

print("--- Environment Variables Visible to Python ---")
# Print all environment variables, be cautious if any are sensitive beyond the API key
# This is for debugging the 'Illegal header value' error.
try:
    # Redact the API key if it's in the environment for this printout
    env_vars_copy = os.environ.copy()
    if 'OPENAI_API_KEY' in env_vars_copy:
        key = env_vars_copy['OPENAI_API_KEY']
        # Also show if key has whitespace issues *before* stripping for debug print
        print(f"DEBUG: Raw OPENAI_API_KEY from env (repr): {repr(key)}")
        env_vars_copy['OPENAI_API_KEY'] = f"{key.strip()[:5]}...{key.strip()[-4:]}" if len(key.strip()) > 8 else "***"

    # Sort for consistent output
    sorted_env_vars = dict(sorted(env_vars_copy.items()))
    print(json.dumps(sorted_env_vars, indent=2))
except Exception as e:
    print(f"Could not print all environment variables: {e}")
print("--- End of Environment Variables ---\n")


print(f"Python version: {sys.version}")
print(f"OpenAI library version: {openai.__version__}")
print(f"HTTPX library version: {httpx.__version__}")
print(f"SSL version: {ssl.OPENSSL_VERSION}")
print(f"Default SSL CA cert file: {ssl.get_default_verify_paths().cafile}")

# --- Basic HTTPS Test with urllib ---
print("\n--- Attempting basic HTTPS connection with urllib ---")
urllib_test_successful = False
try:
    context = ssl.create_default_context()
    req = urllib.request.Request("https://api.openai.com/v1/models", headers={'User-Agent': 'Python-urllib-debug'})
    with urllib.request.urlopen(req, context=context, timeout=10) as response:
        print(f"urllib: Successfully connected. Status: {response.status}")
        if response.status == 401: # Expected for this unauthenticated request
            print("urllib: Received 401 Unauthorized, which means connection to api.openai.com was successful.")
            urllib_test_successful = True
        else:
            print(f"urllib: Received unexpected status {response.status}")
except urllib.error.HTTPError as e:
    print(f"urllib: HTTPError. Status: {e.code}, Reason: {e.reason}")
    if e.code == 401:
        print("urllib: Received 401 Unauthorized, which means connection to api.openai.com was successful.")
        urllib_test_successful = True
    else:
        print(f"urllib: Received unexpected HTTPError: {e}")
except urllib.error.URLError as e:
    print(f"urllib: URLError (often connection related). Reason: {e.reason}")
except Exception as e:
    print(f"urllib: An unexpected error occurred: {str(e)}")
print(f"--- End of urllib HTTPS connection test (Success: {urllib_test_successful}) ---\n")


# --- Direct HTTPretty Test ---
print("--- Attempting direct HTTPS connection with httpx ---")
httpx_test_successful = False
try:
    # No API key needed for this specific endpoint, we expect 401 if connection is fine
    with httpx.Client() as client:
        response = client.get("https://api.openai.com/v1/models", headers={'User-Agent': 'Python-httpx-debug'}, timeout=10)
        print(f"httpx: Successfully connected. Status: {response.status_code}")
        if response.status_code == 401:
            print("httpx: Received 401 Unauthorized, which means connection to api.openai.com was successful.")
            httpx_test_successful = True
        else:
            print(f"httpx: Received unexpected status {response.status_code}. Response: {response.text[:200]}")
except httpx.RequestError as e:
    print(f"httpx: RequestError (problem during request): {e}")
    print("httpx Traceback:")
    traceback.print_exc()
except Exception as e:
    print(f"httpx: An unexpected error occurred: {e}")
    print("httpx Traceback:")
    traceback.print_exc()
print(f"--- End of httpx direct connection test (Success: {httpx_test_successful}) ---\n")


# --- OpenAI Library Test ---
print("--- Attempting connection with OpenAI library ---")
api_key_from_env = os.getenv('OPENAI_API_KEY')

if not api_key_from_env:
    print("Error: OPENAI_API_KEY was not found in the environment for the Python script.")
    sys.exit(1)

# ** FIX: Strip whitespace (like newlines) from the key **
api_key_to_use = api_key_from_env.strip()

if not api_key_to_use: # Check if key is empty after stripping
    print("Error: OPENAI_API_KEY is empty after stripping whitespace.")
    sys.exit(1)

print(f"OpenAI lib is using API Key: {api_key_to_use[:5]}...{api_key_to_use[-4:]}") # Print stripped key info

try:
    # Use the stripped key
    client = openai.OpenAI(api_key=api_key_to_use)
    print("✅ OpenAI client initialized successfully.")
    models = client.models.list() # This is the line that makes the network call
    print("✅ Successfully listed models from OpenAI.")
    if models.data:
        print("Available Models (sample):", [m.id for m in models.data[:5]])
    else:
        print("No models data returned, but connection was successful.")
    print("Debug script (OpenAI part) completed successfully.")

except openai.AuthenticationError as e:
    print(f"❌ OpenAI Authentication Error: {e}")
    print("Please check if the OPENAI_API_KEY is correct and has permissions.")
    sys.exit(1)
except openai.APIConnectionError as e:
    print(f"❌ OpenAI APIConnectionError: {e}") # This is what we were seeing
    print("This indicates a problem connecting to OpenAI's API servers with the OpenAI library.")
    print("Traceback:")
    traceback.print_exc() # Print full traceback for connection errors
    sys.exit(1)
except openai.APIError as e: # Catch other specific OpenAI API errors
    print(f"❌ OpenAI APIError: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ An unexpected error occurred during OpenAI library test: {e}")
    print("Traceback:")
    traceback.print_exc()
    sys.exit(1)

# Final check: if urllib and httpx direct tests passed, but openai lib failed, it's very specific.
if urllib_test_successful and httpx_test_successful:
    print("\nINFO: Both urllib and direct httpx tests succeeded, but the OpenAI library call might have still failed.")
    print("This suggests the issue is highly specific to how the OpenAI library constructs its requests or interacts with httpx.")
elif urllib_test_successful and not httpx_test_successful:
    print("\nINFO: urllib test succeeded, but direct httpx test FAILED.")
    print("This points to an issue specifically with httpx or its environment interaction (e.g., header issues).")
else:
    print("\nINFO: One or both basic connection tests (urllib/httpx) failed. Review their specific errors.")
