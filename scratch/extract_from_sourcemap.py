import json
import os
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"
output_file = "/home/ccl/Code/teeteestock-web/scratch/page_from_sourcemap.tsx"

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx == 369:
            try:
                data = json.loads(line)
                content = data.get("content", "")
                
                # The content contains a JSON string in 'content' field because it's a tool output
                # Let's parse the JSON inside it or extract it using regex
                # Let's search for "sourcesContent\\\":[" in content
                match = re.search(r'"sourcesContent":\s*\[\s*"([^"]+)"', content)
                if not match:
                    # Let's search with escaped quotes
                    match = re.search(r'\\"sourcesContent\\":\s*\[\s*\\"((?:[^\\"]|\\\\.)+)\\"', content)
                
                if match:
                    escaped_code = match.group(1)
                    # Convert escape sequences back to characters
                    # Let's decode it by loading it as a json string
                    json_str = '"' + escaped_code + '"'
                    # Replace double escapes if needed
                    json_str = json_str.replace('\\\\n', '\\n').replace('\\\\"', '\\"')
                    try:
                        code = json.loads(json_str)
                    except Exception as e:
                        # Fallback decode
                        code = escaped_code.encode().decode('unicode_escape')
                    
                    with open(output_file, "w", encoding="utf-8") as out:
                        out.write(code)
                    print(f"Successfully extracted {len(code)} characters to {output_file}")
                else:
                    print("Could not find sourcesContent match in Step 369")
            except Exception as e:
                print("Error:", e)
            break
