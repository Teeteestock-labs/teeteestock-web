import json
import os
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

def extract_and_write(step_num, filename):
    with open(log_path, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f):
            if idx == step_num:
                try:
                    data = json.loads(line)
                    content = data.get("content", "")
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
                        output_file = f"/home/ccl/Code/teeteestock-web/scratch/{filename}"
                        with open(output_file, "w", encoding="utf-8") as out:
                            out.write(code)
                        print(f"Step {step_num} successfully written to {output_file} ({len(cleaned_lines)} lines)")
                    else:
                        print(f"Step {step_num} has no line-numbered lines.")
                except Exception as e:
                    print(f"Error processing step {step_num}: {e}")
                return

extract_and_write(4609, "page_4609.tsx")
extract_and_write(4635, "page_4635.tsx")
extract_and_write(4637, "page_4637.tsx")
extract_and_write(4647, "page_4647.tsx")
