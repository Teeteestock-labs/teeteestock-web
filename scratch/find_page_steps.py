import json
import os
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

if not os.path.exists(log_path):
    print("Log path does not exist:", log_path)
    exit(1)

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            content = data.get("content", "")
            # check if there is a tool call to write_to_file or replace_file_content or multi_replace_file_content for page.tsx
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                method = tc.get("method", "")
                args = tc.get("args", {})
                target = args.get("TargetFile", "") or args.get("Target", "")
                if "page.tsx" in str(target):
                    print(f"Step {idx}: tool call {method} target {target}")
        except Exception as e:
            pass
