import json
import os
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

if not os.path.exists(log_path):
    print("Log path does not exist:", log_path)
    exit(1)

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            content = data.get("content", "")
            if "teeteestock-web/src/app/page.tsx" in content or "src/app/page.tsx" in content:
                total_match = re.search(r"Total Lines: (\d+)", content)
                if total_match:
                    total_lines = int(total_match.group(1))
                    # Print the step index and the total line count
                    print(f"Step {idx} has page.tsx view with {total_lines} lines")
        except Exception as e:
            pass
