import json
import os
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

line_map = {}

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            content = data.get("content", "")
            if "teeteestock-web/src/app/page.tsx" in content or "src/app/page.tsx" in content:
                lines = content.split("\n")
                for l in lines:
                    match = re.match(r"^\s*(\d+):(?: (.*))?$", l)
                    if match:
                        line_num = int(match.group(1))
                        line_code = match.group(2) if match.group(2) is not None else ""
                        if line_code.strip():  # Only count if the line actually has code
                            if line_num not in line_map:
                                line_map[line_num] = []
                            line_map[line_num].append((idx, line_code))
        except Exception as e:
            pass

missing = []
for i in range(1, 761):
    if i not in line_map:
        missing.append(i)

print(f"Missing lines with code completely: {missing}")
print(f"Unique line numbers found with code: {len(line_map)}")
