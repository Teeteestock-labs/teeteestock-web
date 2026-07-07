import json
import os

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"
output_file = "/home/ccl/Code/teeteestock-web/scratch/step_3545_replacement.txt"

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx == 3545:
            try:
                data = json.loads(line)
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    args = tc.get("args", {})
                    if "ReplacementContent" in args:
                        content = args["ReplacementContent"]
                        with open(output_file, "w", encoding="utf-8") as out:
                            out.write(content)
                        print(f"Successfully wrote Step 3545 replacement ({len(content)} chars)")
            except Exception as e:
                print("Error:", e)
            break
