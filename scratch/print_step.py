import json
import os

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

steps_to_inspect = [4481, 4483, 4517]

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx in steps_to_inspect:
            try:
                data = json.loads(line)
                print(f"--- STEP {idx} ---")
                print("Type:", data.get("type"))
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    print("Method:", tc.get("method"))
                    args = tc.get("args", {})
                    # Print keys and summary of values
                    for k, v in args.items():
                        if k in ["CodeContent", "ReplacementContent", "ReplacementChunks"]:
                            print(f"  {k}: [length {len(str(v))}]")
                        else:
                            print(f"  {k}: {v}")
            except Exception as e:
                print(f"Error reading step {idx}: {e}")
