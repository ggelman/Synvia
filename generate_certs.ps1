# Script PowerShell para gerar certificados SSL self-signed
Write-Host "Gerando Certificados SSL para todos os servicos..." -ForegroundColor Green

# Criar diretrio se nao existir
if (!(Test-Path "ssl_certificates")) {
    New-Item -ItemType Directory -Path "ssl_certificates"
    Write-Host "Diretrio ssl_certificates criado" -ForegroundColor Cyan
}

# Verificar se OpenSSL esta disponivel
try {
    Get-Command openssl -ErrorAction Stop | Out-Null
    $hasOpenSSL = $true
    Write-Host "OpenSSL encontrado" -ForegroundColor Green
} catch {
    $hasOpenSSL = $false
    Write-Host "OpenSSL nao encontrado" -ForegroundColor Red
}

if (-not $hasOpenSSL) {
    Write-Host "Usando PowerShell nativo para gerar certificado..." -ForegroundColor Yellow
    
    # Gerar certificado usando PowerShell nativo
    try {
        $cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(1)
        $certPath = "ssl_certificates\localhost.pfx"
        $certPassword = ConvertTo-SecureString -String "synvia123" -Force -AsPlainText
        
        Export-PfxCertificate -Cert $cert -FilePath $certPath -Password $certPassword | Out-Null
        
        Write-Host "Certificado gerado: $certPath" -ForegroundColor Green
        Write-Host "Senha: synvia123" -ForegroundColor Yellow
        
        # Copiar para formato Java
        Copy-Item $certPath "ssl_certificates\keystore.p12"
        Write-Host "Keystore copiado para Java: ssl_certificates\keystore.p12" -ForegroundColor Cyan
        
    } catch {
        Write-Host "Erro ao gerar certificado: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Usando OpenSSL para gerar certificados..." -ForegroundColor Yellow
    
    # Gerar chave privada
    & openssl genrsa -out "ssl_certificates/server.key" 2048
    Write-Host "Chave privada gerada: server.key" -ForegroundColor Cyan
    
    # Gerar certificado self-signed
    & openssl req -new -x509 -key "ssl_certificates/server.key" -out "ssl_certificates/server.crt" -days 365 -subj "/C=BR/ST=SP/L=Sao Paulo/O=GoDigital/OU=Development/CN=localhost"
    Write-Host "Certificado gerado: server.crt" -ForegroundColor Cyan
    
    # Gerar certificado em formato PEM para Python/Flask
    Copy-Item "ssl_certificates/server.crt" "ssl_certificates/server.pem"
    Get-Content "ssl_certificates/server.key" | Add-Content "ssl_certificates/server.pem"
    Write-Host "Certificado PEM gerado para Python: server.pem" -ForegroundColor Cyan
    
    # Gerar keystore para Java/Spring Boot
    & openssl pkcs12 -export -in "ssl_certificates/server.crt" -inkey "ssl_certificates/server.key" -out "ssl_certificates/keystore.p12" -name localhost -password pass:synvia123
    Write-Host "Keystore gerado para Java: keystore.p12" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Certificados SSL gerados com sucesso!" -ForegroundColor Green
Write-Host "Arquivos criados em ssl_certificates/:" -ForegroundColor Cyan

# Listar arquivos gerados
if (Test-Path "ssl_certificates") {
    Get-ChildItem "ssl_certificates" | ForEach-Object {
        Write-Host "   - $($_.Name)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Senha do keystore: synvia123" -ForegroundColor Yellow
Write-Host "Certificado valido para: localhost" -ForegroundColor Yellow