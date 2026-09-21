from PIL import Image
import numpy as np

img = Image.open("public/airplane.png")
# Ensure transparency is clean
mask = np.array(img)[:, :, 3] > 80
h, w = mask.shape

sy, sx = None, None
for y in range(h):
    for x in range(w):
        if mask[y, x]:
            sy, sx = y, x
            break
    if sy is not None:
        break

directions = [(-1,0), (-1,1), (0,1), (1,1), (1,0), (1,-1), (0,-1), (-1,-1)]
boundary = [(sx, sy)]
cx, cy = sx, sy
cdir = 0

for _ in range(4000):
    found = False
    for i in range(8):
        ndir = (cdir + i) % 8
        dy, dx = directions[ndir]
        nx, ny = cx + dx, cy + dy
        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx]:
            cx, cy = nx, ny
            boundary.append((cx, cy))
            cdir = (ndir + 5) % 8
            found = True
            break
    if not found or (cx == sx and cy == sy and len(boundary) > 2):
        break

def point_line_dist(pt, start, end):
    if start == end:
        return float(np.hypot(pt[0]-start[0], pt[1]-start[1]))
    n = abs((end[1]-start[1])*pt[0] - (end[0]-start[0])*pt[1] + end[0]*start[1] - end[1]*start[0])
    d = np.hypot(end[1]-start[1], end[0]-start[0])
    return float(n / d)

def rdp(points, epsilon):
    dmax = 0.0
    index = 0
    for i in range(1, len(points)-1):
        d = point_line_dist(points[i], points[0], points[-1])
        if d > dmax:
            index = i
            dmax = d
    if dmax > epsilon:
        rec1 = rdp(points[:index+1], epsilon)
        rec2 = rdp(points[index:], epsilon)
        return rec1[:-1] + rec2
    else:
        return [points[0], points[-1]]

simplified = rdp(boundary, 0.45)
d_str = "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in simplified) + " Z"
svg = f'''<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
  <path d="{d_str}" />
</svg>'''

with open("public/airplane.svg", "w") as f:
    f.write(svg)

print(f"Generated public/airplane.svg with {len(simplified)} points successfully!")
