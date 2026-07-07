import json
import os

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx > 4398:
            try:
                data = json.loads(line)
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    method = tc.get("method", "")
                    args = tc.get("args", {})
                    target = args.get("TargetFile", "") or args.get("Target", "")
                    if target and ("Code" in str(target) or "src" in str(target)):
                        print(f"Step {idx}: {method} target {target} | Description: {args.get('Description')}")
            except Exception as e:
                pass
