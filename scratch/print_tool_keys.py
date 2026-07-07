import json
import os

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            tool_calls = data.get("tool_calls", [])
            if tool_calls:
                print("Tool call fields:", tool_calls[0].keys())
                print("First tool call:", tool_calls[0])
                break
        except Exception as e:
            pass
