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
            if "Admin Review Panel Layout Refactoring" in content:
                print(f"Step {idx}: Time: {data.get('created_at')} | type: {data.get('type')} | Content starts with: {content[:100]}")
        except Exception as e:
            pass
