import json
import os
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"
output_file = "/home/ccl/Code/teeteestock-web/scratch/page_760_step_4423.tsx"

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx == 4423:
            try:
                data = json.loads(line)
                content = data.get("content", "")
                if "Total Lines: 760" in content:
                    lines = content.split("\n")
                    original_lines = {}
                    for l in lines:
                        match = re.match(r"^\s*(\d+):(?: (.*))?$", l)
                        if match:
                            line_num = int(match.group(1))
                            line_code = match.group(2) if match.group(2) is not None else ""
                            original_lines[line_num] = line_code
                    if len(original_lines) > 0:
                        max_line = max(original_lines.keys())
                        cleaned_lines = []
                        for i in range(1, max_line + 1):
                            cleaned_lines.append(original_lines.get(i, ""))
                        code = "\n".join(cleaned_lines)
                        with open(output_file, "w", encoding="utf-8") as out:
                            out.write(code)
                        print(f"Step 4423 successfully written to {output_file} ({len(cleaned_lines)} lines)")
                    else:
                        print("Step 4423 has no line-numbered lines.")
            except Exception as e:
                print(f"Error: {e}")
            break
