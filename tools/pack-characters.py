"""Slice generated transparent animation cells and normalize sprite baselines.

Only atlas extraction/resizing is performed; the drawings are generated artwork.
"""
from pathlib import Path
from PIL import Image
import json, statistics
root=Path(__file__).resolve().parents[1]
out=root/'app/src/main/assets/art/characters'
out.mkdir(exist_ok=True,parents=True)
report={}
for name,rows in [('raha',3),('friends',2)]:
    source=root/f'artwork/characters/{name}-sheet.png'
    im=Image.open(source).convert('RGBA')
    cells=[]
    for i in range(rows*4):
        x,y=i%4,i//4
        cell=im.crop((round(x*im.width/4),round(y*im.height/rows),round((x+1)*im.width/4),round((y+1)*im.height/rows)))
        box=cell.getchannel('A').point(lambda a:255 if a>100 else 0).getbbox()
        if not box:raise ValueError(f'Empty cell {name}:{i}')
        cells.append((cell,box))
    scale=298/statistics.median(box[3]-box[1] for _,box in cells[:4])
    atlas=Image.new('RGBA',(1024,rows*320))
    for i,(cell,box) in enumerate(cells):
        sprite=cell.crop(box)
        w,h=round(sprite.width*scale),round(sprite.height*scale)
        if w>254 or h>312:
            factor=min(254/w,312/h);w,h=round(w*factor),round(h*factor)
        sprite=sprite.resize((w,h),Image.Resampling.LANCZOS)
        frame=Image.new('RGBA',(256,320))
        frame.alpha_composite(sprite,((256-w)//2,312-h))
        atlas.alpha_composite(frame,((i%4)*256,(i//4)*320))
    atlas.save(out/f'{name}.webp',quality=92,method=6)
    report[name]={'frames':rows*4,'cellWidth':256,'cellHeight':320,'width':atlas.width,'height':atlas.height}
    if name=='raha':
        atlas.crop((0,0,256,180)).save(out/'raha-portrait.webp',quality=94,method=6)
    else:
        atlas.crop((0,0,256,180)).save(out/'sohrab-portrait.webp',quality=94,method=6)
        atlas.crop((0,320,256,500)).save(out/'saman-portrait.webp',quality=94,method=6)
(root/'docs/character-atlas.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
