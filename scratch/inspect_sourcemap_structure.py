import json
import os

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"
output_file = "/home/ccl/Code/teeteestock-web/scratch/step_369_raw.txt"

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx == 369:
            data = json.loads(line)
            content = data.get("content", "")
            with open(output_file, "w", encoding="utf-8") as out:
                out.write(content)
            print(f"Written Step 369 raw content ({len(content)} chars)")
            
            # Find index of sourcesContent
            idx_sc = content.find("sourcesContent")
            if idx_sc != -1:
                print("Found sourcesContent at index:", idx_sc)
                print("Preview around sourcesContent:")
                print(content[idx_sc:idx_sc+300])
            break
