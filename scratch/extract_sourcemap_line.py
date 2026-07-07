import json

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"
output_file = "/home/ccl/Code/teeteestock-web/scratch/page_extracted_from_line_369.tsx"

with open(log_path, "r", encoding="utf-8") as f:
    for line_num, line in enumerate(f, 1):
        if line_num == 369:
            try:
                data = json.loads(line)
                content = data.get("content", "")
                
                # Let's write the raw content to a file to inspect it
                with open("/home/ccl/Code/teeteestock-web/scratch/line_369_raw.txt", "w", encoding="utf-8") as out:
                    out.write(content)
                print(f"Line 369 content dumped (length {len(content)})")
                
                # Let's find "sourcesContent"
                # The content is a JSON-encoded string because it's a tool output
                # Let's parse it as JSON
                tool_output = json.loads(content)
                # the tool output is a string or a dict?
                # It is a grep search output, which has JSON format
                # Let's print its type and keys
                print("Type of tool output:", type(tool_output))
                if isinstance(tool_output, dict):
                    print("Keys:", tool_output.keys())
                elif isinstance(tool_output, list):
                    print("List length:", len(tool_output))
                    print("First element keys:", tool_output[0].keys() if tool_output[0] else "empty")
            except Exception as e:
                print("Error:", e)
            break
