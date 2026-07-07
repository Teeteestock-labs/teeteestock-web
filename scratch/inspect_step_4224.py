import json
import os

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx == 4225:
            try:
                data = json.loads(line)
                content = data.get("content", "")
                print(f"Step 4225 Content length: {len(content)}")
                # print lines containing colons to see which lines are present
                lines = content.split("\n")
                present = []
                for l in lines:
                    if ":" in l:
                        present.append(l.split(":")[0].strip())
                print("Line numbers present in Step 4225:")
                print(present[:20], "...", present[-20:])
            except Exception as e:
                print("Error:", e)
            break
