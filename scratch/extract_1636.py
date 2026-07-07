import json
import os

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"
output_file = "/home/ccl/Code/teeteestock-web/scratch/page_1636.tsx"

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx == 1636:
            try:
                data = json.loads(line)
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    args = tc.get("args", {})
                    if "CodeContent" in args:
                        content = args["CodeContent"]
                        with open(output_file, "w", encoding="utf-8") as out:
                            out.write(content)
                        print(f"Step 1636 successfully written to {output_file} ({len(content)} chars)")
            except Exception as e:
                print("Error:", e)
            break
