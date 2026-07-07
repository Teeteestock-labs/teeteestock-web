import json
import os

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if 4420 <= idx <= 4430:
            try:
                data = json.loads(line)
                print(f"Step {idx}: Type: {data.get('type')} | Source: {data.get('source')} | Status: {data.get('status')}")
                if data.get('type') == 'TOOL_RESPONSE' or 'content' in data:
                    content = data.get('content', '')
                    print(f"  Content length: {len(content)}")
                    if "600:" in content:
                        print("  Found line 600 in content!")
            except Exception as e:
                pass
