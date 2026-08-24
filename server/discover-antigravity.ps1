param([string]$WorkspacePath)
$proc = Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'language_server' } | Select-Object -First 1
$p = $proc.ProcessId
$ports = (netstat -ano | Select-String 'LISTENING' | Select-String "\b$p\b" | %{ [regex]::Match($_, '127\.0\.0\.1:(\d+)').Groups[1].Value })
$port = $ports | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum
$cmd = $proc.CommandLine
$csrf = [regex]::Match($cmd, '--csrf_token\s+([a-zA-Z0-9\-]+)').Groups[1].Value
# Strategy 1: Check ~/.gemini/config/projects/*.json (Authoritative config)
if ($WorkspacePath) {
    try {
        $projectsDir = Join-Path $env:USERPROFILE '.gemini/config/projects'
        if (Test-Path $projectsDir) {
            $wsNorm = ($WorkspacePath.TrimEnd('\') -replace '\\','/').ToLower()
            Get-ChildItem $projectsDir -Filter '*.json' | ForEach-Object {
                if ($_.Name -ne 'outside-of-project.json' -and -not $projectId) {
                    try {
                        $json = Get-Content $_.FullName -Raw | ConvertFrom-Json
                        $resources = $json.projectResources.resources
                        foreach ($r in $resources) {
                            $u = if ($r.folderUri) { $r.folderUri } else { $r.gitFolder.folderUri }
                            if ($u) {
                                $dec = ([System.Uri]::UnescapeDataString($u) -replace '^file:/+','' -replace '\\','/').TrimEnd('/').ToLower()
                                if ($wsNorm -eq $dec -or $wsNorm.StartsWith($dec + '/')) {
                                    $projectId = $json.id
                                    break
                                }
                            }
                        }
                    } catch {}
                }
            }
        }
    } catch {}
}

# Strategy 2: Fallback to agyhub_summaries_proto.pb
$pbPath = Join-Path $env:USERPROFILE '.gemini/antigravity/agyhub_summaries_proto.pb'
if (-not $projectId -and (Test-Path $pbPath) -and $WorkspacePath) {
    try {
        $raw = [System.IO.File]::ReadAllText($pbPath)
        $driveLetter = $WorkspacePath.Substring(0,1).ToLower()
        $restPath = ($WorkspacePath.Substring(2) -replace '\\','/')
        $encodedUri = 'file:///' + $driveLetter + '%3A' + $restPath
        $uuidPat = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
        $idx = $raw.IndexOf($encodedUri, [System.StringComparison]::OrdinalIgnoreCase)
        if ($idx -ge 0) {
            $after = $raw.Substring($idx + $encodedUri.Length, [Math]::Min(200, $raw.Length - $idx - $encodedUri.Length))
            $m = [regex]::Match($after, $uuidPat)
            if ($m.Success) {
                $projectId = $m.Value
            }
        }
    } catch {}
}

Write-Output "$port|$csrf|$projectId"
