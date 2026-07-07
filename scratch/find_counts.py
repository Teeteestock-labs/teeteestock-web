import json
import os
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

if not os.path.exists(log_path):
    print("Log path does not exist:", log_path)
    exit(1)

counts = {}

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            content = data.get("content", "")
            if "teeteestock-web/src/app/page.tsx" in content or "src/app/page.tsx" in content:
                lines = content.split("\n")
                line_count = 0
                for l in lines:
                    match = re.match(r"^\s*(\d+):", l)
                    if match:
                        num = int(match.group(1))
                        if num > line_count:
                            line_count = num
                if line_count > 0:
                    counts[line_count] = counts.get(line_count, 0) + 1
        except Exception as e:
            pass

print("Distinct line counts found in logs:")
for count, freq in sorted(counts.items()):
    print(f"Line count: {count}, frequency: {freq}")
