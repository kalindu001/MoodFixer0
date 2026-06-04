# Compare local files with remote ones using Git blob SHA-1 hashes
$remote_json = '[{"type":"file","size":12,"name":"README.md","path":"README.md","sha":"444e1f8274c732af4ecaf0ab560b337ffccc0205"},{"type":"file","size":19160,"name":"app.js","path":"app.js","sha":"494d0cc4af91aafcde9e2b56ca3882f8c019fc6b"},{"type":"file","size":799741,"name":"cozy_atmosphere.png","path":"cozy_atmosphere.png","sha":"9a0ec0be29a4d33ff646e23620b260acda644879"},{"type":"file","size":1574660,"name":"data.js","path":"data.js","sha":"f52a85135a7dbba0e86e324136cd3da8ad508368"},{"type":"file","size":16664,"name":"faq.html","path":"faq.html","sha":"fce0459b532bd5225ab26ade8c218e1555ff5eb8"},{"type":"file","size":589169,"name":"footer-bg.png","path":"footer-bg.png","sha":"cf343f926e3e2ee7b0b39d5194adf34e2715507c"},{"type":"file","size":16257,"name":"index.html","path":"index.html","sha":"16d48768d45a1296286d8fd9ec84091e317bec4f"},{"type":"file","size":1285698,"name":"inspiring_nature.png","path":"inspiring_nature.png","sha":"3d0f6bf822b0f425240c840f796e5213d06b4939"},{"type":"file","size":1052101,"name":"joyful_moment.png","path":"joyful_moment.png","sha":"254c8e932aa7398cf9b8693a5834713ca697e1d0"},{"type":"file","size":192696,"name":"mood fix logo.png","path":"mood fix logo.png","sha":"2f2bd912132be69c52c5ac8c3278243e91fb8b2a"},{"type":"file","size":799114,"name":"peaceful_landscape.png","path":"peaceful_landscape.png","sha":"e100970a2f340bb8480f68846755b60267e57409"},{"type":"file","size":14181,"name":"privacy.html","path":"privacy.html","sha":"978fbf525ab352856e58b45230fbdca51f751460"},{"type":"file","size":11378,"name":"safety.html","path":"safety.html","sha":"91ccf571a0a79da83c3d1b3f5667aae3b7003016"},{"type":"file","size":40557,"name":"style.css","path":"style.css","sha":"1aa54dce237d2d73231e3d41b47a49d60182eb8d"},{"type":"file","size":13882,"name":"terms.html","path":"terms.html","sha":"291b28e3248d8dd825304e20985e4e04eccdd480"},{"type":"file","size":8314,"name":"tracking.html","path":"tracking.html","sha":"3b3bdf101c635d9d8f8b1bf5da434e0a375a8f5b"},{"type":"file","size":13651,"name":"tracking.js","path":"tracking.js","sha":"5fa1c6f0fd5d399bf5d5a09fc8c710548eb7df0c"}]' | ConvertFrom-Json

$workspace = "c:\Users\-e-\Desktop\mood fixer project"

function Get-GitBlobSha {
    param (
        [string]$FilePath
    )
    $bytes = [System.IO.File]::ReadAllBytes($FilePath)
    $headerStr = "blob " + $bytes.Length + "`0"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headerStr)
    
    $combinedBytes = New-Object byte[] ($headerBytes.Length + $bytes.Length)
    [System.Buffer]::BlockCopy($headerBytes, 0, $combinedBytes, 0, $headerBytes.Length)
    [System.Buffer]::BlockCopy($bytes, 0, $combinedBytes, $headerBytes.Length, $bytes.Length)
    
    $sha1 = [System.Security.Cryptography.SHA1]::Create()
    $hashBytes = $sha1.ComputeHash($combinedBytes)
    
    $hashStr = ""
    foreach ($b in $hashBytes) {
        $hashStr += $b.ToString("x2")
    }
    return $hashStr
}

$modified = @()
$untracked = @()

# Get all files in local directory (excluding our utility files)
$localFiles = Get-ChildItem -Path $workspace -File | Where-Object { 
    $_.Name -notlike "prepare_payload*" -and $_.Name -notlike "push_payload.json"
}

foreach ($file in $localFiles) {
    $localSha = Get-GitBlobSha $file.FullName
    $remoteFile = $remote_json | Where-Object { $_.name -eq $file.Name }
    
    if ($null -eq $remoteFile) {
        $untracked += [PSCustomObject]@{
            Name = $file.Name
            LocalSha = $localSha
        }
    } else {
        if ($localSha -ne $remoteFile.sha) {
            $modified += [PSCustomObject]@{
                Name = $file.Name
                LocalSha = $localSha
                RemoteSha = $remoteFile.sha
            }
        }
    }
}

Write-Output "--- MODIFIED FILES ---"
$modified | Format-Table
Write-Output "--- UNTRACKED FILES ---"
$untracked | Format-Table
