import json
import os

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx == 4657:
            try:
                data = json.loads(line)
                print("Type:", data.get("type"))
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    print("Method:", tc.get("method"))
                    args = tc.get("args", {})
                    for k, v in args.items():
                        if k in ["CodeContent", "ReplacementContent", "ReplacementChunks"]:
                            print(f"  {k}: [length {len(str(v))}]")
                        else:
                            print(f"  {k}: {v}")
            except Exception as e:
                print("Error:", e)
            break
