import json

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("step_index") == 3902 and data.get("source") == "MODEL":
                for tc in data["tool_calls"]:
                    args = tc.get("args", {})
                    if "page.tsx" in args.get("TargetFile", ""):
                        # args["ReplacementContent"] is a string already decoded from JSON.
                        # However, since we got double escaped content in the raw transcript or log,
                        # let's just use json.loads on the serialized argument or write the python string.
                        content = args.get("ReplacementContent")
                        # Content is a python string. If it contains literal \n sequences, we can decode it.
                        with open("/home/ccl/Code/teeteestock-web/scratch/step_3902_decoded.txt", "w", encoding="utf-8") as out:
                            out.write(content)
                        print("Wrote decoded file successfully!")
        except Exception as e:
            print("Error:", e)
