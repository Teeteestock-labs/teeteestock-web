import json
import os
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

line_map = {}

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if 3545 < idx <= 4480:
            try:
                data = json.loads(line)
                if data.get("type") == "VIEW_FILE":
                    content = data.get("content", "")
                    filepath_match = re.search(r"File Path:\s*`([^`]+)`", content)
                    if filepath_match and filepath_match.group(1).endswith("src/app/page.tsx"):
                        lines = content.split("\n")
                        for l in lines:
                            match = re.match(r"^\s*(\d+):(?: (.*))?$", l)
                            if match:
                                line_num = int(match.group(1))
                                line_code = match.group(2) if match.group(2) is not None else ""
                                line_map[line_num] = line_code
            except Exception as e:
                pass

missing = []
for i in range(1, 761):
    if i not in line_map:
        missing.append(i)

print(f"Number of lines collected after Step 3545: {len(line_map)}")
print(f"Missing lines: {missing}")
