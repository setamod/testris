"""Rebuild the existing BLOK mark as opaque iPhone app icons (requires Pillow)."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFilter

root = Path(__file__).resolve().parents[1]
icons = root / 'ios/Blok/Assets.xcassets/AppIcon.appiconset'
icons.mkdir(parents=True, exist_ok=True)
size = 1024
image = Image.new('RGB', (size, size), '#080b14')
light = Image.new('RGBA', image.size)
draw = ImageDraw.Draw(light)
draw.ellipse((-180, -160, 700, 720), fill=(5, 120, 150, 25))
draw.ellipse((360, 360, 1180, 1180), fill=(180, 20, 100, 24))
image = Image.alpha_composite(image.convert('RGBA'), light.filter(ImageFilter.GaussianBlur(95)))
glow = Image.new('RGBA', image.size)
glow_draw = ImageDraw.Draw(glow)
cells = [(226, 226, 482, 482), (542, 226, 798, 482), (226, 542, 482, 798), (542, 542, 798, 798)]
for index, box in enumerate(cells):
    color = '#ff3e9d' if index == 3 else '#05eef5'
    glow_draw.rectangle(box, outline=color, width=14)
image = Image.alpha_composite(image, glow.filter(ImageFilter.GaussianBlur(22)))
draw = ImageDraw.Draw(image)
draw.line([(96, 780), (96, 96), (780, 96)], fill='#17566a', width=3)
draw.line([(244, 928), (928, 928), (928, 244)], fill='#703254', width=3)
for index, (left, top, right, bottom) in enumerate(cells):
    color = '#ff3e9d' if index == 3 else '#05eef5'
    draw.rectangle((left, top, right, bottom), fill='#de2a88' if index == 3 else '#08313d', outline=color, width=9)
    if index != 3:
        draw.rectangle((left+23, top+23, right-23, bottom-23), outline='#176078', width=3)
    draw.line((left+17, top+14, right-17, top+14), fill='#ffe1f1' if index == 3 else '#c6ffff', width=3)
    draw.line((right-39, bottom-20, right-18, bottom-20), fill='#ffffff', width=3)
image = image.convert('RGB')
entries = []
for points, scale in [(20, 2), (20, 3), (29, 2), (29, 3), (40, 2), (40, 3), (60, 2), (60, 3)]:
    filename = f'AppIcon-{points}@{scale}x.png'
    pixels = points * scale
    image.resize((pixels, pixels), Image.Resampling.LANCZOS).save(icons / filename)
    entries.append({'idiom':'iphone', 'size':f'{points}x{points}', 'scale':f'{scale}x', 'filename':filename})
image.save(icons / 'AppIcon-1024.png')
entries.append({'idiom':'ios-marketing','size':'1024x1024','scale':'1x','filename':'AppIcon-1024.png'})
(icons / 'Contents.json').write_text(json.dumps({'images':entries,'info':{'author':'xcode','version':1}},indent=2)+'\n')
print(f'{len(entries)} opaque iPhone/App Store icons generated: {icons}')
