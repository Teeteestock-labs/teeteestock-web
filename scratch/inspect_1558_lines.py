import json

with open("/home/ccl/Code/teeteestock-web/scratch/page_736_step_1558.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(590, 620):
    if i < len(lines):
        print(f"{i+1}: {repr(lines[i])}")
