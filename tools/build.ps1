param([switch]$DebugBuild,[switch]$Offline)
$ErrorActionPreference='Stop'
$projectRoot=Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
# Share a writable native cache with Gradle's child JVM as well as its launcher.
if(-not [Environment]::GetEnvironmentVariable('org.gradle.native.dir')){
    [Environment]::SetEnvironmentVariable('org.gradle.native.dir',(Join-Path $projectRoot '.gradle-native'),'Process')
}
if(-not $env:JAVA_HOME -and (Test-Path 'D:\AndroidToolchain\jdk-17.0.20.1+1')){$env:JAVA_HOME='D:\AndroidToolchain\jdk-17.0.20.1+1'}
$gradleTool=Join-Path $projectRoot 'gradlew.bat'
if(Test-Path 'D:\AndroidToolchain\gradle\gradle-8.7\bin\gradle.bat'){
    $gradleTool='D:\AndroidToolchain\gradle\gradle-8.7\bin\gradle.bat'
    if(-not $env:GRADLE_USER_HOME){$env:GRADLE_USER_HOME=Join-Path $projectRoot '.gradle-user'}
    $sharedCache=Join-Path (Split-Path -Parent $projectRoot) '.gradle-home\caches'
    if(-not $env:GRADLE_RO_DEP_CACHE -and (Test-Path (Join-Path $sharedCache 'modules-2'))){$env:GRADLE_RO_DEP_CACHE=$sharedCache}
    if(-not $env:ANDROID_USER_HOME){$env:ANDROID_USER_HOME=Join-Path $projectRoot '.android-user'}
}
$variant=if($DebugBuild){'debug'}else{'release'}
$buildArgs=@('--no-daemon','--console=plain',":app:assemble$variant",":app:lint$variant")
if($Offline){$buildArgs+='--offline'}
& $gradleTool @buildArgs
if($LASTEXITCODE -ne 0){throw 'Android build failed'}
New-Item -ItemType Directory -Force -Path dist | Out-Null
$versionMatch=[regex]::Match((Get-Content -Raw 'app\build.gradle'),"versionName '([^']+)'")
if(-not $versionMatch.Success){throw 'Missing versionName'}
$version=$versionMatch.Groups[1].Value
Copy-Item -LiteralPath "app\build\outputs\apk\$variant\app-$variant.apk" -Destination "dist\GardenOfSecrets-$version-$variant.apk" -Force
Get-FileHash -LiteralPath "dist\GardenOfSecrets-$version-$variant.apk" -Algorithm SHA256
