import json
import os

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

steps = [4128, 4154, 4170, 4483]

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx in steps:
            try:
                data = json.loads(line)
                print(f"--- STEP {idx} ---")
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    method = tc.get("method", "")
                    args = tc.get("args", {})
                    print(f"Method: {method}")
                    print(f"TargetFile: {args.get('TargetFile')}")
                    print(f"Instruction: {args.get('Instruction')}")
                    print(f"Description: {args.get('Description')}")
                    for k in ["CodeContent", "ReplacementContent", "ReplacementChunks"]:
                        if k in args:
                            val = args[k]
                            if isinstance(val, str):
                                print(f"  {k} length: {len(val)}, starts with: {repr(val[:100])}")
                            else:
                                print(f"  {k} type: {type(val)}, length/keys: {len(val)}")
            except Exception as e:
                print(f"Error for step {idx}: {e}")
