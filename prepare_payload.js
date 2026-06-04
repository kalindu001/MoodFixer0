const fs = require('fs');
const path = require('path');

const filesToRead = ['app.js', 'index.html', 'style.css'];
const workspace = "c:\\Users\\-e-\\Desktop\\mood fixer project";

const payload = {};
filesToRead.forEach(filename => {
    const filePath = path.join(workspace, filename);
    payload[filename] = fs.readFileSync(filePath, 'utf8');
});

const outputPath = path.join(workspace, 'push_payload.json');
fs.writeFileSync(outputPath, JSON.stringify(payload), 'utf8');

console.log("Payload created successfully at:", outputPath);
