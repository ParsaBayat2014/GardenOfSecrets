"""Rasterize the project's existing geometric launcher icon for a store draft."""
from pathlib import Path
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parents[1]
scale=4
im=Image.new('RGB',(512*scale,512*scale),'#123e3b')
d=ImageDraw.Draw(im)
def pts(values):return [(round(x*512/108*scale),round(y*512/108*scale)) for x,y in values]
d.polygon(pts([(54,10),(97,54),(54,98),(11,54)]),fill='#e9bf68')
d.polygon(pts([(54,18),(89,54),(54,90),(19,54)]),fill='#246b62')
u=512/108*scale
d.ellipse([34*u,30*u,58*u,54*u],outline='#ffe8a5',width=round(6*u))
d.line(pts([(55,53),(76,74)]),fill='#ffe8a5',width=round(6*u))
d.line(pts([(65,63),(59,69)]),fill='#ffe8a5',width=round(6*u))
d.line(pts([(71,69),(65,75)]),fill='#ffe8a5',width=round(6*u))
im.resize((512,512),Image.Resampling.LANCZOS).save(root/'store-assets/icon-512.png')
