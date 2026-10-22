"""Fetch the exact public CC-BY source bundle; verify before extracting the one .blend."""
from pathlib import Path
import hashlib,json,urllib.request,zipfile
r=Path(__file__).resolve().parents[1];folder=r/'art-source/vendor';info=json.loads((folder/'SOURCE.json').read_text(encoding='utf8'));archive=folder/'ellie-pose-library-v2.0.0.zip'
if not archive.exists():
 with urllib.request.urlopen(info['download'],timeout=120) as source,archive.open('wb') as target:
  while True:
   block=source.read(1024*1024)
   if not block:break
   target.write(block)
if hashlib.sha256(archive.read_bytes()).hexdigest()!=info['sha256']:raise SystemExit('Source checksum mismatch; do not use this download')
with zipfile.ZipFile(archive) as bundle:
 name=next(n for n in bundle.namelist()if n.endswith('.blend'));(folder/'ellie-original.blend').write_bytes(bundle.read(name))
print('Verified Blender Studio source. Keep Blender-Studio-Ellie.txt attribution with adaptations.')
