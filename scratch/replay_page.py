import json
import os

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"
output_path = "/home/ccl/Code/teeteestock-web/scratch/page_reconstructed_replay.tsx"

steps = [3634, 3817, 3868, 3884, 3888, 3902, 4261, 4267, 4273, 4383, 4387, 4413, 4429]
tool_calls = {}

with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            step = data.get("step_index")
            if step in steps and data.get("source") == "MODEL" and data.get("tool_calls"):
                for tc in data["tool_calls"]:
                    if "page.tsx" in tc.get("args", {}).get("TargetFile", ""):
                        tool_calls[step] = (tc.get("name"), tc.get("args"))
        except Exception as e:
            pass

# 1. Initialize from Step 3634 (write_to_file)
name, args = tool_calls[3634]
code = args["CodeContent"]
print(f"Initialized from Step 3634. Length: {len(code)}")

# Helper to do clean string replacements
def apply_replace(step, current_code, target, replacement):
    # Normalize line endings
    target_norm = target.replace("\r\n", "\n")
    replacement_norm = replacement.replace("\r\n", "\n")
    current_code_norm = current_code.replace("\r\n", "\n")
    
    if target_norm not in current_code_norm:
        # Try without surrounding quotes if applicable, or print warning
        print(f"WARNING [Step {step}]: TargetContent not found in code!")
        print(f"TargetContent first 100 chars: {repr(target_norm[:100])}")
        return current_code
    
    count = current_code_norm.count(target_norm)
    new_code = current_code_norm.replace(target_norm, replacement_norm)
    print(f"Step {step}: Replaced {count} occurrences of TargetContent.")
    return new_code

# Replay modifications
for step in steps[1:]:
    name, args = tool_calls[step]
    if name == "replace_file_content":
        target = args["TargetContent"]
        replacement = args["ReplacementContent"]
        code = apply_replace(step, code, target, replacement)
    elif name == "multi_replace_file_content":
        chunks = args["ReplacementChunks"]
        print(f"Step {step} (multi_replace_file_content): Processing {len(chunks)} chunks.")
        for chunk in chunks:
            target = chunk["TargetContent"]
            replacement = chunk["ReplacementContent"]
            code = apply_replace(step, code, target, replacement)

with open(output_path, "w", encoding="utf-8") as out:
    out.write(code)

print(f"Successfully replayed all steps and wrote output to {output_path}!")
