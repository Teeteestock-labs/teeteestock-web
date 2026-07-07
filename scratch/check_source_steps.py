import json
import os
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

line_sources = {}
line_codes = {}

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx <= 4480:
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
                                
                                # Truncation prevention rule
                                if line_num in line_codes:
                                    existing = line_codes[line_num]
                                    if existing.startswith(line_code) and len(existing) > len(line_code):
                                        continue
                                
                                line_codes[line_num] = line_code
                                line_sources[line_num] = idx
            except Exception as e:
                pass

for ln in [34, 40, 44, 49, 53, 58, 61]:
    print(f"Line {ln} came from Step {line_sources.get(ln)}: {repr(line_codes.get(ln))}")
