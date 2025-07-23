# utils/file_loader.py

import csv
import json
import os

def load_csv(filepath):
    if not os.path.exists(filepath):
        return {"status": "error", "message": f"{filepath} not found"}
    
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        return {"status": "success", "data": list(reader)}

def load_text(filepath):
    if not os.path.exists(filepath):
        return {"status": "error", "message": f"{filepath} not found"}
    
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read().strip()
        return {"status": "success", "content": content}

def load_json_lines(filepath):
    if not os.path.exists(filepath):
        return {"status": "error", "message": f"{filepath} not found"}

    data = []
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            try:
                data.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return {"status": "success", "entries": data}
