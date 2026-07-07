import json
import os
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

missing_ranges = list(range(565, 574)) + list(range(661, 692))
found_lines = {}

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx == 3652:
            try:
                data = json.loads(line)
                content = data.get("content", "")
                lines = content.split("\n")
                for l in lines:
                    match = re.match(r"^\s*(\d+):(?: (.*))?$", l)
                    if match:
                        line_num = int(match.group(1))
                        line_code = match.group(2) if match.group(2) is not None else ""
                        if line_num in missing_ranges and line_code.strip():
                            found_lines[line_num] = line_code
            except Exception as e:
                pass

print("Lines found in Step 3652:")
for r in sorted(missing_ranges):
    if r in found_lines:
        print(f"Line {r}: {repr(found_lines[r])}")
    else:
        print(f"Line {r}: NOT found")
