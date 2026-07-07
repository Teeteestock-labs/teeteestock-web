import json

input_path = "/home/ccl/Code/teeteestock-web/scratch/page_1636.tsx"
output_path = "/home/ccl/Code/teeteestock-web/scratch/page_1636_decoded.tsx"

with open(input_path, "r", encoding="utf-8") as f:
    raw = f.read().strip()

# If it starts and ends with quotes, or is a JSON string:
if raw.startswith('"') and raw.endswith('"'):
    try:
        decoded = json.loads(raw)
    except Exception as e:
        # try decoding escape sequences
        decoded = raw[1:-1].encode().decode('unicode_escape')
else:
    # Try decoding as json string directly
    try:
        decoded = json.loads('"' + raw + '"')
    except Exception as e:
        decoded = raw.encode().decode('unicode_escape')

with open(output_path, "w", encoding="utf-8") as out:
    out.write(decoded)

print(f"Decoded file written to {output_path} ({len(decoded)} chars)")
