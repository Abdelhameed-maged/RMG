# script/gpt_review.py
import openai
import os
import sys
import json
import time
import traceback

try:
    import tiktoken
    TIKTOKEN_AVAILABLE = True
except ImportError:
    TIKTOKEN_AVAILABLE = False
    print(
        "Warning: tiktoken library not found. Falling back to character-based "
        "token estimation for chunking. For more accurate chunking, please "
        "install tiktoken (`pip install tiktoken`) in the runner's environment.",
        file=sys.stderr,
    )

# --- Configuration ---
DEFAULT_PROMPT_TEMPLATE = (
    "You are a senior MEAN stack engineer reviewing the following code diff for "
    "bugs, performance issues, or best practices. Provide concise, actionable "
    "feedback for this specific chunk of the diff. If this is part of a larger "
    "diff, focus only on the provided chunk."
)
STRICT_PROMPT_TEMPLATE = (
    "You are a senior engineer reviewing the following code diff. Refactor the "
    "code for modularity, performance, and clarity. Suggest exact code changes "
    "where possible for this specific chunk of the diff. If this is part of a "
    "larger diff, focus only on the provided chunk."
)
LIGHT_PROMPT_TEMPLATE = (
    "You are reviewing the following code diff for readability and style "
    "consistency. Highlight minor improvements for this specific chunk of the "
    "diff. If this is part of a larger diff, focus only on the provided chunk."
)

# Allow override from workflow/env, default stays same
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.1")  # or "gpt-4.1"

# TPM Settings - allow override
YOUR_TPM_LIMIT = int(os.getenv("TPM_LIMIT", "30000"))  # tokens per minute
if YOUR_TPM_LIMIT <= 0:
    print("❌ Configuration Error: TPM_LIMIT must be > 0", file=sys.stderr)
    sys.exit(1)

# Chunking settings - allow override
MAX_CHUNK_INPUT_TOKENS = int(os.getenv("MAX_CHUNK_INPUT_TOKENS", "4000"))
TOKENS_PER_CALL_ESTIMATE = int(os.getenv("TOKENS_PER_CALL_ESTIMATE", "9000"))

if MAX_CHUNK_INPUT_TOKENS <= 0:
    print("❌ Configuration Error: MAX_CHUNK_INPUT_TOKENS must be > 0", file=sys.stderr)
    sys.exit(1)

# Reserve some tokens for system prompt + chunk intro safety margin
CHUNK_OVERHEAD_TOKENS = int(os.getenv("CHUNK_OVERHEAD_TOKENS", "250"))

# Overall Script Time Limit
MAX_SCRIPT_DURATION_SECONDS = int(os.getenv("MAX_SCRIPT_DURATION_SECONDS", str(7 * 60)))  # 7 minutes

# --- Get Environment Variables ---
api_key_from_env = os.getenv("OPENAI_API_KEY")
diff_file_path = os.getenv("DIFF_FILE")
pr_labels_json = os.getenv("PR_LABELS_JSON")


def get_token_count(text: str, model_name: str) -> int:
    """
    Returns integer token count for a piece of text.
    Uses tiktoken if available; otherwise falls back to rough char estimate.
    """
    if not TIKTOKEN_AVAILABLE:
        # align with workflow heuristic: ~1 token per 4 chars
        return max(1, len(text) // 4)

    try:
        try:
            encoding = tiktoken.encoding_for_model(model_name)
        except KeyError:
            # Newer models (e.g., gpt-5.1) may not be mapped yet in tiktoken.
            encoding = tiktoken.get_encoding("o200k_base")

        return len(encoding.encode(text))
    except Exception as e:
        print(
            f"Warning: Failed token count for model {model_name}: {e}. "
            "Falling back to char-based estimate.",
            file=sys.stderr,
        )
        return max(1, len(text) // 4)


def create_chunks(diff_content: str, max_tokens_per_chunk: int, model_name: str):
    """
    Splits diff content into chunks of roughly max_tokens_per_chunk
    (minus overhead for prompts/intro).
    """
    safe_max = max(1, max_tokens_per_chunk - CHUNK_OVERHEAD_TOKENS)

    chunks = []
    current_chunk_lines = []
    current_token_count = 0

    lines = diff_content.splitlines(keepends=True)

    for line in lines:
        line_token_count = get_token_count(line, model_name)

        if current_token_count + line_token_count > safe_max and current_chunk_lines:
            chunks.append("".join(current_chunk_lines))
            current_chunk_lines = [line]
            current_token_count = line_token_count
        else:
            current_chunk_lines.append(line)
            current_token_count += line_token_count

    if current_chunk_lines:
        chunks.append("".join(current_chunk_lines))

    # Fallback if we somehow didn't create chunks but have content
    if not chunks and diff_content:
        avg_chars_per_token = 4
        max_chars_per_chunk = safe_max * avg_chars_per_token
        step = int(max_chars_per_chunk) or 1

        for i in range(0, len(diff_content), step):
            chunks.append(diff_content[i:i + step])

    return chunks if chunks else [diff_content]


def main():
    script_start_time = time.time()

    # --- Validate API key ---
    if not api_key_from_env:
        error_message = "❌ Configuration Error: OPENAI_API_KEY secret not set."
        print(error_message, file=sys.stderr)
        with open("review.txt", "w", encoding="utf-8") as f:
            f.write(error_message)
        sys.exit(1)

    api_key = api_key_from_env.strip()
    if not api_key:
        error_message = "❌ Configuration Error: OPENAI_API_KEY is empty after stripping whitespace."
        print(error_message, file=sys.stderr)
        with open("review.txt", "w", encoding="utf-8") as f:
            f.write(error_message)
        sys.exit(1)

    # --- Determine prompt by labels ---
    prompt_template_to_use = DEFAULT_PROMPT_TEMPLATE
    review_mode = "default"

    try:
        labels_data = json.loads(pr_labels_json or "[]")
        label_names = {
            label.get("name")
            for label in labels_data
            if isinstance(label.get("name"), str)
        }

        if "gpt-review-strict" in label_names:
            prompt_template_to_use = STRICT_PROMPT_TEMPLATE
            review_mode = "strict"
        elif "gpt-review-light" in label_names:
            prompt_template_to_use = LIGHT_PROMPT_TEMPLATE
            review_mode = "light"
        elif "gpt-review-default" in label_names:
            prompt_template_to_use = DEFAULT_PROMPT_TEMPLATE
            review_mode = "default"

        print(f"Determined review mode: {review_mode}")
    except Exception as e:
        print(
            f"Warning: Label parsing failed: {e}. Falling back to default prompt.",
            file=sys.stderr,
        )

    # --- Read diff file ---
    if not diff_file_path:
        error_message = (
            f"❌ GPT Review failed (mode: {review_mode}): "
            "DIFF_FILE environment variable not set."
        )
        print(error_message, file=sys.stderr)
        with open("review.txt", "w", encoding="utf-8") as f:
            f.write(error_message)
        sys.exit(1)

    try:
        with open(diff_file_path, "r", encoding="utf-8") as f:
            diff_content = f.read()
    except Exception as e:
        error_message = (
            f"❌ GPT Review failed (mode: {review_mode}): "
            f"Error reading diff file '{diff_file_path}' - {e}"
        )
        print(error_message, file=sys.stderr)
        with open("review.txt", "w", encoding="utf-8") as f:
            f.write(error_message)
        sys.exit(1)

    if not diff_content.strip():
        print("Warning: Diff content is empty or whitespace only.", file=sys.stderr)
        with open("review.txt", "w", encoding="utf-8") as f:
            f.write("❓ Review skipped: Diff content is empty or whitespace only.")
        sys.exit(0)

    # --- Chunk diff ---
    diff_chunks = create_chunks(diff_content, MAX_CHUNK_INPUT_TOKENS, OPENAI_MODEL)
    print(f"Diff split into {len(diff_chunks)} chunks.")

    all_review_parts = []
    overall_api_call_succeeded = True
    time_limit_reached = False

    client = openai.OpenAI(api_key=api_key)

    for i, chunk_text in enumerate(diff_chunks):
        elapsed_time = time.time() - script_start_time

        if elapsed_time > MAX_SCRIPT_DURATION_SECONDS:
            print(
                f"Warning: Script execution time limit "
                f"({MAX_SCRIPT_DURATION_SECONDS}s) reached. "
                "Stopping further chunk processing.",
                file=sys.stderr,
            )
            all_review_parts.append(
                f"\n\n--- REVIEW TRUNCATED DUE TO TIME LIMIT "
                f"({MAX_SCRIPT_DURATION_SECONDS // 60} minutes) ---"
            )
            time_limit_reached = True
            overall_api_call_succeeded = False
            break

        print(
            f"Processing chunk {i+1} of {len(diff_chunks)} "
            f"(Elapsed time: {elapsed_time:.0f}s)..."
        )

        chunk_intro = ""
        if len(diff_chunks) > 1:
            chunk_intro = (
                f"This is chunk {i+1} of {len(diff_chunks)} of a larger code diff. "
                "Please focus your review on this specific chunk, considering it "
                "in the context of a larger set of changes.\n\n"
            )

        messages = [
            {"role": "system", "content": prompt_template_to_use},
            {"role": "user", "content": chunk_intro + chunk_text},
        ]

        try:
            print(
                f"Attempting API call for chunk {i+1} "
                f"(Model: {OPENAI_MODEL}, Mode: {review_mode})..."
            )
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=messages,
            )

            chunk_review_text = response.choices[0].message.content

            tokens_used_this_call = TOKENS_PER_CALL_ESTIMATE
            if response.usage and response.usage.total_tokens:
                tokens_used_this_call = response.usage.total_tokens
                print(f"Tokens used for chunk {i+1}: {tokens_used_this_call}")

            all_review_parts.append(
                f"--- Review for Chunk {i+1}/{len(diff_chunks)} ---\n{chunk_review_text}"
            )
            print(f"Chunk {i+1} processed successfully.")

            # Throttle before next chunk
            if i < len(diff_chunks) - 1:
                elapsed_time_now = time.time() - script_start_time
                delay_seconds = (tokens_used_this_call / YOUR_TPM_LIMIT) * 60.0 + 1.0

                min_sleep = 2.0
                max_sleep = 45.0
                delay_seconds = max(min_sleep, min(delay_seconds, max_sleep))

                if elapsed_time_now + delay_seconds > MAX_SCRIPT_DURATION_SECONDS:
                    print(
                        f"Warning: Calculated delay ({delay_seconds:.2f}s) "
                        f"for chunk {i+1} would exceed total time limit. "
                        "Not sleeping and stopping further processing.",
                        file=sys.stderr,
                    )
                    all_review_parts.append(
                        f"\n\n--- REVIEW TRUNCATED DUE TO TIME LIMIT "
                        f"({MAX_SCRIPT_DURATION_SECONDS // 60} minutes) ---"
                    )
                    time_limit_reached = True
                    overall_api_call_succeeded = False
                    break

                print(f"Delaying for {delay_seconds:.2f} seconds to respect TPM limit...")
                time.sleep(delay_seconds)

        except openai.RateLimitError as e:
            error_msg_part = (
                f"❌ Rate limit exceeded on chunk {i+1} (mode: {review_mode}): {e}"
            )
            print(error_msg_part, file=sys.stderr)
            all_review_parts.append(error_msg_part)
            overall_api_call_succeeded = False

            remaining = MAX_SCRIPT_DURATION_SECONDS - (time.time() - script_start_time)
            if remaining <= 0:
                all_review_parts.append(
                    f"\n\n--- REVIEW TRUNCATED DUE TO TIME LIMIT "
                    f"({MAX_SCRIPT_DURATION_SECONDS // 60} minutes) ---"
                )
                time_limit_reached = True
                break

            sleep_time = min(60, remaining)
            print(f"Waiting for {sleep_time:.0f} seconds due to rate limit...")
            time.sleep(sleep_time)
            continue

        except openai.APIConnectionError as e:
            error_msg_part = (
                f"❌ API connection error on chunk {i+1} (mode: {review_mode}): {e}"
            )
            print(error_msg_part, file=sys.stderr)
            all_review_parts.append(error_msg_part)
            overall_api_call_succeeded = False
            break

        except openai.AuthenticationError as e:
            error_msg_part = (
                f"❌ Authentication error on chunk {i+1} (mode: {review_mode}): {e}"
            )
            print(error_msg_part, file=sys.stderr)
            all_review_parts.append(error_msg_part)
            overall_api_call_succeeded = False
            break

        except openai.BadRequestError as e:
            error_msg_part = (
                f"❌ Invalid request on chunk {i+1} (mode: {review_mode}): {e}"
            )
            print(error_msg_part, file=sys.stderr)
            all_review_parts.append(error_msg_part)
            overall_api_call_succeeded = False
            break  # stop further chunks; likely persistent

        except openai.APIError as e:
            error_msg_part = (
                f"❌ OpenAI API error on chunk {i+1} (mode: {review_mode}): {e}"
            )
            print(error_msg_part, file=sys.stderr)
            all_review_parts.append(error_msg_part)
            overall_api_call_succeeded = False
            break  # stop further chunks; likely persistent

        except Exception as e:
            error_msg_part = (
                f"❌ Unexpected error on chunk {i+1} (mode: {review_mode}): {e}"
            )
            print(error_msg_part, file=sys.stderr)
            traceback.print_exc()
            all_review_parts.append(error_msg_part)
            overall_api_call_succeeded = False
            break

    final_review_text = "\n\n".join(all_review_parts)
    if not final_review_text.strip():
        final_review_text = (
            "⚠️ Review generation process completed, but no content was generated "
            "or an error occurred."
        )

    if time_limit_reached and "REVIEW TRUNCATED DUE TO TIME LIMIT" not in final_review_text:
        final_review_text += (
            f"\n\n--- REVIEW TRUNCATED DUE TO TIME LIMIT "
            f"({MAX_SCRIPT_DURATION_SECONDS // 60} minutes) ---"
        )

    try:
        with open("review.txt", "w", encoding="utf-8") as f:
            f.write(final_review_text)

        if overall_api_call_succeeded and all_review_parts and not time_limit_reached:
            print("Overall review generated successfully and written to review.txt.")
        elif time_limit_reached:
            print("Review process truncated due to time limit; partial results written to review.txt.")
        else:
            print("Review process completed with errors or no content; details written to review.txt.")
    except Exception as e:
        print(f"FATAL: Error writing review.txt file: {e}", file=sys.stderr)
        sys.exit(1)

    # If we had errors (but still produced some text), don't fail the PR pipeline
    # unless you want strict CI. Keep consistent with other repos.
    sys.exit(0)


if __name__ == "__main__":
    main()
