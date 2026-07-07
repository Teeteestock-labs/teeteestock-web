with open("/home/ccl/Code/teeteestock-web/scratch/step_3545_replacement.txt", "r", encoding="utf-8") as f:
    raw = f.read().strip()

# Strip starting and ending double quote
if raw.startswith('"') and raw.endswith('"'):
    raw_str = raw[1:-1]
else:
    raw_str = raw

# Decode unicode escapes
decoded = raw_str.encode('utf-8').decode('unicode_escape')

with open("/home/ccl/Code/teeteestock-web/scratch/step_3545_replacement_decoded.txt", "w", encoding="utf-8") as out:
    out.write(decoded)

print("Decoded Step 3545 replacement:")
print(decoded[:500])
