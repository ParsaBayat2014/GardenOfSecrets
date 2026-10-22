"""Extract generated animation cells into runtime atlases (no redrawing)."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]
destination=root/'app/src/main/assets/art/characters'
def pack(source,columns,rows,width,height,name,mode):
    image=Image.open(root/source).convert('RGBA')
    atlas=Image.new('RGBA',(columns*width,rows*height))
    report=[]
    for i in range(columns*rows):
        x,y=i%columns,i//columns
        tile=image.crop((round(x*image.width/columns),round(y*image.height/rows),round((x+1)*image.width/columns),round((y+1)*image.height/rows)))
        box=tile.getchannel('A').point(lambda a:255 if a>32 else 0).getbbox()
        if not box:raise ValueError(f'Empty sprite {name}:{i}')
        crop=tile.crop(box)
        scale=min((width-20)/crop.width,(height-22)/crop.height)
        sprite=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.LANCZOS)
        # Grounded feet / waist baseline, with uniform margins in all cells.
        dx=(width-sprite.width)//2;dy=height-8-sprite.height
        atlas.alpha_composite(sprite,(x*width+dx,y*height+dy))
        report.append({'index':i,'sourceBox':list(box),'baseline':height-8})
    atlas.save(destination/(name+'.webp'),quality=94,method=6)
    return {'name':name,'columns':columns,'rows':rows,'cellWidth':width,'cellHeight':height,'frames':report,'source':source}
reports=[]
reports.append(pack('artwork/characters/raha-walk-v3.png',4,2,256,320,'walk-v3','walk'))
if (root/'artwork/characters/portraits-v3.png').exists():
    reports.append(pack('artwork/characters/portraits-v3.png',3,3,384,384,'portraits-v3','portrait'))
else:
    # Reframe the original licensed-in-project characters for stable dialogue.
    # Fixed crops preserve the same head size and origin between expressions.
    sources=[('raha',[0,2,10]),('friends',[0,1,2]),('friends',[4,5,6])]
    atlas=Image.new('RGBA',(1152,1152))
    for row,(sheet,frames) in enumerate(sources):
        original=Image.open(destination/(sheet+'.webp')).convert('RGBA')
        for column,index in enumerate(frames):
            x=index%4*256;y=index//4*320
            tile=original.crop((x+20,y,x+236,y+216)).resize((384,384),Image.Resampling.LANCZOS)
            atlas.alpha_composite(tile,(column*384,row*384))
    atlas.save(destination/'portraits-v3.webp',quality=96,method=6)
    reports.append({'name':'portraits-v3','columns':3,'rows':3,'cellWidth':384,'cellHeight':384,'frames':list(range(9)),'source':'Original raha.webp and friends.webp; fixed portrait crops'})
(root/'docs/animation-v3-atlas.json').write_text(json.dumps(reports,indent=2),encoding='utf-8')
print(json.dumps([{'name':r['name'],'frames':len(r['frames'])} for r in reports]))
