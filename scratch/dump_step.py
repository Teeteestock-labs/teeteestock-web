import json
import os

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

steps = [4423, 4425]

for s in steps:
    with open(log_path, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f):
            if idx == s:
                try:
                    data = json.loads(line)
                    content = data.get("content", "")
                    out_path = f"/home/ccl/Code/teeteestock-web/scratch/step_{s}_content.txt"
                    with open(out_path, "w", encoding="utf-8") as out:
                        out.write(content)
                    print(f"Dumped step {s} content to {out_path}")
                except Exception as e:
                    print(f"Error: {e}")
                break
