import json
import os
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"
output_path = "/home/ccl/Code/teeteestock-web/src/app/page.tsx"

if not os.path.exists(log_path):
    print("Log path does not exist:", log_path)
    exit(1)

best_content = None
best_lines_count = 0

with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            content = data.get("content", "")
            if "teeteestock-web/src/app/page.tsx" in content or "src/app/page.tsx" in content:
                # Find log with lines
                lines = content.split("\n")
                line_count = 0
                for l in lines:
                    match = re.match(r"^\s*(\d+):", l)
                    if match:
                        num = int(match.group(1))
                        if num > line_count:
                            line_count = num
                # We want the longest clean version, let's say between 730 and 770
                if 730 <= line_count <= 770 and line_count > best_lines_count:
                    best_content = content
                    best_lines_count = line_count
        except Exception as e:
            pass

if best_content:
    print(f"Found clean page.tsx content with {best_lines_count} lines!")
    lines = best_content.split("\n")
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
        cleaned_code = "\n".join(cleaned_lines)
        with open(output_path, "w", encoding="utf-8") as out:
            out.write(cleaned_code)
        print(f"Successfully recovered {len(cleaned_lines)} lines to {output_path}!")
    else:
        print("Failed to clean up lines.")
else:
    print("Could not find page.tsx in logs.")
