# GridSense AI - Verification Suite
# Compatible with PowerShell 5.1+

$ErrorActionPreference = "SilentlyContinue"
$pass = 0
$fail = 0
$results = @()

function Test-Get {
    param([string]$Label, [string]$Url, [int]$ExpectCode = 200)
    try {
        $r = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec 8
        $code = $r.StatusCode
    } catch {
        $code = [int]$_.Exception.Response.StatusCode
        if (-not $code) { $code = 0 }
    }
    $ok = $code -eq $ExpectCode
    return @{ Label=$Label; Ok=$ok; Code=$code; Expect=$ExpectCode }
}

function Test-Post {
    param([string]$Label, [string]$Url, [string]$Body, [int]$ExpectCode = 200)
    try {
        $r = Invoke-WebRequest -Uri $Url -Method POST -Body $Body -ContentType "application/json" -UseBasicParsing -TimeoutSec 8
        $code = $r.StatusCode
    } catch {
        $code = [int]$_.Exception.Response.StatusCode
        if (-not $code) { $code = 0 }
    }
    $ok = $code -eq $ExpectCode
    return @{ Label=$Label; Ok=$ok; Code=$code; Expect=$ExpectCode }
}

function Test-Patch {
    param([string]$Label, [string]$Url, [string]$Body, [int]$ExpectCode = 200)
    try {
        $r = Invoke-WebRequest -Uri $Url -Method PATCH -Body $Body -ContentType "application/json" -UseBasicParsing -TimeoutSec 8
        $code = $r.StatusCode
    } catch {
        $code = [int]$_.Exception.Response.StatusCode
        if (-not $code) { $code = 0 }
    }
    $ok = $code -eq $ExpectCode
    return @{ Label=$Label; Ok=$ok; Code=$code; Expect=$ExpectCode }
}

function Print-Result {
    param([hashtable]$r)
    if ($r.Ok) {
        Write-Host ("  [PASS] " + $r.Label + " (HTTP " + $r.Code + ")") -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host ("  [FAIL] " + $r.Label + " (got HTTP " + $r.Code + ", expected " + $r.Expect + ")") -ForegroundColor Red
        $script:fail++
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  GridSense AI - Full Verification Suite" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# ---- GROUP 1: Health & Topology ----
Write-Host ""
Write-Host "[1/6] Health & Topology" -ForegroundColor Yellow
Print-Result (Test-Get "Backend /api/health"    "http://localhost:4000/api/health")
Print-Result (Test-Get "ML service /health"     "http://localhost:8000/health")
Print-Result (Test-Get "RAG service /health"    "http://localhost:8001/health")
Print-Result (Test-Get "Frontend /"             "http://localhost:3000")

# ---- GROUP 2: Grid Telemetry ----
Write-Host ""
Write-Host "[2/6] Grid Telemetry" -ForegroundColor Yellow
Print-Result (Test-Get "GET /api/grid/status"   "http://localhost:4000/api/grid/status")
Print-Result (Test-Get "GET /api/grid/history"  "http://localhost:4000/api/grid/history")

# ---- GROUP 3: ML Prediction ----
Write-Host ""
Write-Host "[3/6] ML Prediction" -ForegroundColor Yellow
$predBody = '{"solar_mw":310,"wind_mw":180,"load_mw":850,"voltage_pu":0.96,"frequency_hz":49.85,"reactive_power_mvar":120,"renewable_ramp_pct":8,"load_variation_pct":5,"scenario_name":"Verification Test"}'
Print-Result (Test-Post "POST /api/predictions (valid)" "http://localhost:4000/api/predictions" $predBody 201)
Print-Result (Test-Get  "GET  /api/predictions"         "http://localhost:4000/api/predictions")

# ---- GROUP 4: Input Validation ----
Write-Host ""
Write-Host "[4/6] Input Validation (expect HTTP 400)" -ForegroundColor Yellow
$badBody = '{"renewablePenetration":200,"frequency":95}'
Print-Result (Test-Post "POST /api/predictions (bad physics)" "http://localhost:4000/api/predictions" $badBody 400)

# ---- GROUP 5: RAG Assistant ----
Write-Host ""
Write-Host "[5/6] RAG Assistant" -ForegroundColor Yellow
$ragBody = '{"query":"What is the swing equation and why does inertia matter?","sessionId":"verify-001"}'
Print-Result (Test-Post "POST /api/assistant/query"    "http://localhost:4000/api/assistant/query" $ragBody)
Print-Result (Test-Get  "GET  /api/assistant/documents" "http://localhost:4000/api/assistant/documents")

# ---- GROUP 6: Alerts ----
Write-Host ""
Write-Host "[6/6] Alerts" -ForegroundColor Yellow
Print-Result (Test-Get "GET /api/alerts"  "http://localhost:4000/api/alerts")
$ackBody = '{"status":"ACKNOWLEDGED"}'
Print-Result (Test-Patch "PATCH /api/alerts/1 (acknowledge)" "http://localhost:4000/api/alerts/1" $ackBody)

# ---- SUMMARY ----
$total = $pass + $fail
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ("  RESULT: $pass / $total tests passed") -ForegroundColor Cyan
if ($fail -eq 0) {
    Write-Host "  ALL TESTS PASSED - GridSense AI is fully operational!" -ForegroundColor Green
} else {
    Write-Host ("  $fail test(s) FAILED") -ForegroundColor Red
}
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
