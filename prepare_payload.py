import json
import os

files_to_read = ['app.js', 'index.html', 'style.css']
workspace = r"c:\Users\-e-\Desktop\mood fixer project"

payload = {}
for filename in files_to_read:
    path = os.path.join(workspace, filename)
    with open(path, 'r', encoding='utf-8') as f:
        payload[filename] = f.read()

# Write as minified single-line JSON to avoid multiple lines with prefixes
output_path = os.path.join(workspace, 'push_payload.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(payload, f)

print("Payload created successfully at:", output_path)
