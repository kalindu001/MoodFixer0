$workspace = "c:\Users\-e-\Desktop\mood fixer project"
$files = @("app.js", "index.html", "style.css", "ai.html", "faq.html", "privacy.html", "safety.html", "terms.html", "tracking.html", "sitemap.xml", "robots.txt")
$payload = @{}
foreach ($file in $files) {
    $content = Get-Content -Raw -Path (Join-Path $workspace $file) -Encoding utf8
    $payload[$file] = $content
}
$json = ConvertTo-Json $payload -Compress
Set-Content -Path (Join-Path $workspace "push_payload.json") -Value $json -Encoding utf8
Write-Output "Payload created successfully!"
