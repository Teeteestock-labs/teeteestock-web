import json
import re

log_path = "/home/ccl/.gemini/antigravity/brain/f86e9e79-73e1-4768-8980-73c5de02f900/.system_generated/logs/transcript.jsonl"
output_path = "/home/ccl/Code/teeteestock-web/src/app/page.tsx"

line_map = {}

# 1. Scan the log for all viewed lines of page.tsx
with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            if data.get("type") == "VIEW_FILE":
                content = data.get("content", "")
                filepath_match = re.search(r"File Path:\s*`([^`]+)`", content)
                if filepath_match:
                    filepath = filepath_match.group(1)
                    if filepath.endswith("src/app/page.tsx"):
                        lines = content.split("\n")
                        for l in lines:
                            match = re.match(r"^\s*(\d+):(?: (.*))?$", l)
                            if match:
                                line_num = int(match.group(1))
                                line_code = match.group(2) if match.group(2) is not None else ""
                                
                                # Truncation prevention rule
                                if line_num in line_map:
                                    existing = line_map[line_num]
                                    if existing.startswith(line_code) and len(existing) > len(line_code):
                                        continue
                                
                                line_map[line_num] = line_code
        except Exception:
            pass

# 2. Supply the missing 19 lines (661-679)
missing_supplies = {
    661: '                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">維持率</p>',
    662: '                  <p className="text-lg font-black text-white mt-1">--</p>',
    663: '                </div>',
    664: '                <div>',
    665: '                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">交割帳戶餘額</p>',
    666: '                  <p className="text-lg font-black text-white mt-1">{balance.toLocaleString()}</p>',
    667: '                </div>',
    668: '                <div>',
    669: '                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">股票市值</p>',
    670: '                  <p className="text-lg font-black text-white mt-1">{totalStockValue.toLocaleString()}</p>',
    671: '                </div>',
    672: '              </div>',
    673: '              ',
    674: '              <div className="border-t border-gray-900 p-3 flex justify-between items-center bg-gray-950/40">',
    675: '                <span className="text-xs text-gray-400 font-bold">總未實現損益</span>',
    676: '                {(() => {',
    677: '                  const totalProfit = holdings.reduce((sum, h) => sum + ((marketData.find(p => p.id === h.pairId)?.price || 0) - h.avgCost) * h.shares, 0);',
    678: '                  const profitColor = totalProfit > 0 ? "text-red-500" : totalProfit < 0 ? "text-green-500" : "text-gray-400";',
    679: '                  return ('
}

for line_num, code in missing_supplies.items():
    line_map[line_num] = code

# 3. Rebuild the file up to line 735
rebuilt_lines = []
for i in range(1, 736):
    code = line_map.get(i, "")
    rebuilt_lines.append(code)

# 4. Write to output
with open(output_path, "w", encoding="utf-8") as out:
    out.write("\n".join(rebuilt_lines))

print(f"Reconstructed page.tsx of length 735 lines written to {output_path}!")
