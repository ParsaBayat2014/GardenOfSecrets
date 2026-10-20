param([switch]$DebugBuild,[switch]$Offline)
$ErrorActionPreference='Stop'
$projectRoot=Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
if(-not $env:JAVA_HOME -and (Test-Path 'D:\AndroidToolchain\jdk-17.0.20.1+1')){$env:JAVA_HOME='D:\AndroidToolchain\jdk-17.0.20.1+1'}
$gradleTool=Join-Path $projectRoot 'gradlew.bat'
if(Test-Path 'D:\AndroidToolchain\gradle\gradle-8.7\bin\gradle.bat'){
    $gradleTool='D:\AndroidToolchain\gradle\gradle-8.7\bin\gradle.bat'
    $env:GRADLE_USER_HOME=Join-Path (Split-Path -Parent $projectRoot) '.gradle-home'
    $env:ANDROID_USER_HOME=Join-Path (Split-Path -Parent $projectRoot) '.android'
}
$variant=if($DebugBuild){'debug'}else{'release'}
$buildArgs=@('--no-daemon','--console=plain',":app:assemble$variant",":app:lint$variant")
if($Offline){$buildArgs+='--offline'}
& $gradleTool @buildArgs
if($LASTEXITCODE -ne 0){throw 'Android build failed'}
New-Item -ItemType Directory -Force -Path dist | Out-Null
Copy-Item -LiteralPath "app\build\outputs\apk\$variant\app-$variant.apk" -Destination "dist\GardenOfSecrets-0.1.0-$variant.apk" -Force
Get-FileHash -LiteralPath "dist\GardenOfSecrets-0.1.0-$variant.apk" -Algorithm SHA256
