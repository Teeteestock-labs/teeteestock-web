import json
import os
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

missing_ranges = list(range(565, 574)) + list(range(661, 692))
found_lines = {}

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
                        if line_num in missing_ranges and line_code.strip():
                            if line_num not in found_lines:
                                found_lines[line_num] = []
                            found_lines[line_num].append((idx, line_code))
        except Exception as e:
            pass

print("Search results for missing lines:")
for line_num in sorted(missing_ranges):
    matches = found_lines.get(line_num, [])
    if matches:
        print(f"Line {line_num}: found {len(matches)} times. Last one in Step {matches[-1][0]}: {repr(matches[-1][1])}")
    else:
        print(f"Line {line_num}: NOT found anywhere!")
