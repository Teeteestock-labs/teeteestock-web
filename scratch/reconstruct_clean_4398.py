import json
import os
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"
output_file = "/home/ccl/Code/teeteestock-web/scratch/page_reconstructed.tsx"

line_map = {}
line_sources = {}

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx <= 4480:
            try:
                data = json.loads(line)
                if data.get("type") == "VIEW_FILE":
                    content = data.get("content", "")
                    filepath_match = re.search(r"File Path:\s*`([^`]+)`", content)
                    if filepath_match:
                        filepath = filepath_match.group(1)
                        if filepath.endswith("src/app/page.tsx"):
                            lines = content.split("\n")
                            for l in lines:
                                match = re.match(r"^\s*(\d+):(?: (.*))?$", l)
                                if match:
                                    line_num = int(match.group(1))
                                    line_code = match.group(2) if match.group(2) is not None else ""
                                    
                                    # Truncation prevention rule
                                    if line_num in line_map:
                                        existing = line_map[line_num]
                                        if existing.startswith(line_code) and len(existing) > len(line_code):
                                            continue
                                    
                                    line_map[line_num] = line_code
                                    line_sources[line_num] = idx
            except Exception as e:
                pass

if len(line_map) > 0:
    max_line = max(line_map.keys())
    print(f"Collected {len(line_map)} lines. Max line number: {max_line}")
    missing = [i for i in range(1, max_line + 1) if i not in line_map]
    print(f"Missing lines: {missing}")
    
    cleaned_lines = []
    for i in range(1, max_line + 1):
        cleaned_lines.append(line_map.get(i, ""))
    
    with open(output_file, "w", encoding="utf-8") as out:
        out.write("\n".join(cleaned_lines))
    print(f"Reconstructed page.tsx written to {output_file}")
else:
    print("No lines collected!")
