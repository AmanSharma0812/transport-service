# Run this script in PowerShell as Administrator to install MongoDB

Write-Host "Installing MongoDB Community Edition..." -ForegroundColor Green

# Install Chocolatey (if not already installed)
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Install MongoDB
choco install mongodb-community -y

Write-Host "`nMongoDB installed successfully!" -ForegroundColor Green
Write-Host "`nStarting MongoDB service..." -ForegroundColor Yellow

# Start MongoDB service
net start MongoDB

Write-Host "`n✅ MongoDB is now running!" -ForegroundColor Green
Write-Host "`nYou can verify by running: mongosh" -ForegroundColor Cyan
Write-Host "Type 'exit' to quit the MongoDB shell.`n" -ForegroundColor Cyan