import json
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"
line_map = {}

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            step = data.get("step_index")
            if step is not None and 4274 <= step <= 4458:
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
                                    line_map[line_num] = line_code
        except Exception:
            pass

if line_map:
    max_line = max(line_map.keys())
    missing = [i for i in range(1, max_line + 1) if i not in line_map]
    print(f"Max line: {max_line}, Collected count: {len(line_map)}, Missing count: {len(missing)}, Missing lines: {missing}")
else:
    print("No lines collected!")
