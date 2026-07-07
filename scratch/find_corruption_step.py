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
            if "teeteestock-web/src/app/page.tsx" in content or "src/app/page.tsx" in content:
                lines = content.split("\n")
                line_count = 0
                empty_lines = 0
                for l in lines:
                    match = re.match(r"^\s*(\d+):(?: (.*))?$", l)
                    if match:
                        num = int(match.group(1))
                        if num > line_count:
                            line_count = num
                        code = match.group(2) if match.group(2) is not None else ""
                        if not code.strip():
                            empty_lines += 1
                if line_count > 100:
                    print(f"Step {idx}: total lines seen {line_count}, empty lines in view: {empty_lines}")
        except Exception as e:
            pass
