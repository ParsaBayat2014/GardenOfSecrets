"""Create a new project-specific local release key, never publish signing/."""
from pathlib import Path
import secrets, subprocess
root=Path(__file__).resolve().parents[1]
folder=root/'signing'
folder.mkdir(exist_ok=True)
key=folder/'garden-release.jks'
if key.exists():
    raise SystemExit('A release key already exists; refusing to replace it.')
password=secrets.token_urlsafe(32)
(folder/'password.txt').write_text(password,encoding='utf-8')
tool=Path(r'D:/AndroidToolchain/jdk-17.0.20.1+1/bin/keytool.exe')
subprocess.run([str(tool),'-genkeypair','-keystore',str(key),'-storetype','JKS','-alias','garden','-keyalg','RSA','-keysize','3072','-validity','10000','-storepass:file',str(folder/'password.txt'),'-keypass:file',str(folder/'password.txt'),'-dname','CN=Garden Of Secrets, O=Independent Games, C=IR'],check=True,capture_output=True)
(folder/'release.properties').write_text('storeFile=signing/garden-release.jks\nstorePassword='+password+'\nkeyAlias=garden\nkeyPassword='+password+'\n',encoding='utf-8')
print('Project-specific release key created. Keep the entire signing directory private and backed up.')
