import json
import os
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            if data.get("type") == "VIEW_FILE":
                content = data.get("content", "")
                filepath_match = re.search(r"File Path:\s*`([^`]+)`", content)
                if filepath_match and filepath_match.group(1).endswith("src/app/page.tsx"):
                    lines = content.split("\n")
                    for l in lines:
                        match = re.match(r"^\s*48:(?: (.*))?$", l)
                        if match:
                            print(f"Step {idx}: {repr(match.group(1))}")
        except Exception as e:
            pass
