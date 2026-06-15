#!/usr/bin/env python3
"""
Category image generator for Dynamics Market.
Generates creative industrial-themed PNG images, uploads via API, updates MongoDB.
"""

import os
import io
import math
import warnings
import requests
from pymongo import MongoClient
from bson import ObjectId
from PIL import Image, ImageDraw, ImageFont, ImageFilter

warnings.filterwarnings("ignore")

# ─── Config ────────────────────────────────────────────────────────────────────
MONGO_URI = "mongodb://dm_admin:DmAdmin2026SecurePass@37.27.37.227:27017/admin?authSource=admin"
UPLOAD_URL = "https://backend.dynamics-market.uz/file-upload/upload"
IMG_W, IMG_H = 800, 600

FONT_BOLD = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_LIGHT = "/System/Library/Fonts/HelveticaNeue.ttc"

# ─── Categories config ─────────────────────────────────────────────────────────
CATEGORIES = [
    {
        "name_uz": "Avtomatlashtirish va sanoat elektronika",
        "slug": "automation-electronics",
        "colors": [(15, 32, 78), (30, 64, 175)],      # deep navy → royal blue
        "accent": (96, 165, 250),
        "icon": "circuit",
    },
    {
        "name_uz": "Energetika va elektr ta’minoti",
        "slug": "energy-power",
        "colors": [(120, 53, 15), (234, 88, 12)],      # dark brown → vivid orange
        "accent": (251, 191, 36),
        "icon": "lightning",
    },
    {
        "name_uz": "Neft va gaz sanoati",
        "slug": "oil-gas",
        "colors": [(17, 24, 39), (55, 65, 81)],        # near-black → dark gray
        "accent": (156, 163, 175),
        "icon": "derrick",
    },
    {
        "name_uz": "Sanoat aloqasi va tarmoqlar",
        "slug": "communications-networks",
        "colors": [(6, 78, 59), (4, 120, 87)],          # dark green → emerald
        "accent": (52, 211, 153),
        "icon": "network",
    },
    {
        "name_uz": "Harakatlantiruvchi texnika, motorlar va reduktorlar",
        "slug": "motors-drives",
        "colors": [(30, 41, 59), (51, 65, 85)],         # slate dark → slate
        "accent": (148, 163, 184),
        "icon": "gear",
    },
    {
        "name_uz": "Elektr shkaflari va taqsimlash tizimlari uchun komponentlar",
        "slug": "electrical-cabinets",
        "colors": [(23, 37, 84), (30, 58, 138)],        # navy → indigo
        "accent": (129, 140, 248),
        "icon": "cabinet",
    },
    {
        "name_uz": "Klapanlar, quvur armaturasi va gidravlika",
        "slug": "valves-hydraulics",
        "colors": [(12, 74, 110), (3, 105, 161)],       # dark sky → sky blue
        "accent": (56, 189, 248),
        "icon": "valve",
    },
    {
        "name_uz": "Avtomatlashtirish va dispetcherlik dasturlari",
        "slug": "scada-software",
        "colors": [(17, 24, 39), (31, 41, 55)],         # near-black → dark
        "accent": (34, 211, 238),
        "icon": "scada",
    },
    {
        "name_uz": "Yoritish uskunalari va elektrotexnika mahsulotlari",
        "slug": "lighting",
        "colors": [(113, 63, 18), (180, 83, 9)],        # amber dark → amber
        "accent": (252, 211, 77),
        "icon": "bulb",
    },
    {
        "name_uz": "Kabel mahsulotlari va elektr ulanishlari",
        "slug": "cables",
        "colors": [(15, 23, 42), (30, 27, 75)],         # very dark navy → purple
        "accent": (167, 139, 250),
        "icon": "cable",
    },
    {
        "name_uz": "Binolar xavfsizligi va avtomatlashtirish tizimlari",
        "slug": "building-security",
        "colors": [(20, 83, 45), (21, 128, 61)],        # dark green → green
        "accent": (74, 222, 128),
        "icon": "shield",
    },
    {
        "name_uz": "Nasos uskunalari va suyuqlik ta’minoti tizimlari",
        "slug": "pumps",
        "colors": [(7, 89, 133), (2, 132, 199)],        # deep ocean → blue
        "accent": (56, 189, 248),
        "icon": "pump",
    },
    {
        "name_uz": "Sanoat filtrlash va tozalash tizimlari",
        "slug": "filtration",
        "colors": [(30, 64, 175), (37, 99, 235)],       # blue → brighter blue
        "accent": (147, 197, 253),
        "icon": "filter",
    },
    {
        "name_uz": "Portlashdan himoyalangan uskunalar (Ex-sertifikatlash)",
        "slug": "explosion-proof",
        "colors": [(127, 29, 29), (185, 28, 28)],       # dark red → red
        "accent": (252, 165, 165),
        "icon": "explosion",
    },
    {
        "name_uz": "Nazorat-o'lchov asboblari (KIPiA)",
        "slug": "measurement",
        "colors": [(31, 41, 55), (55, 65, 81)],         # dark gray → gray
        "accent": (209, 213, 219),
        "icon": "gauge",
    },
]


# ─── Gradient background ────────────────────────────────────────────────────────
def draw_gradient(img: Image.Image, c1, c2):
    draw = ImageDraw.Draw(img)
    for y in range(IMG_H):
        t = y / IMG_H
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        draw.line([(0, y), (IMG_W, y)], fill=(r, g, b))


# ─── Decorative dots grid ───────────────────────────────────────────────────────
def draw_dots(draw, accent, alpha=40):
    r, g, b = accent
    for x in range(0, IMG_W, 40):
        for y in range(0, IMG_H, 40):
            draw.ellipse([x - 1, y - 1, x + 1, y + 1],
                         fill=(r, g, b, alpha))


# ─── Icon helpers ───────────────────────────────────────────────────────────────
def draw_circuit(draw, cx, cy, accent, lw=3):
    a = accent
    # outer ring
    r = 120
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=a, width=lw)
    # inner ring
    r2 = 70
    draw.ellipse([cx-r2, cy-r2, cx+r2, cy+r2], outline=a, width=lw)
    # cross lines
    draw.line([cx-r, cy, cx+r, cy], fill=a, width=lw)
    draw.line([cx, cy-r, cx, cy+r], fill=a, width=lw)
    # corner nodes
    for angle in [0, 90, 180, 270]:
        rad = math.radians(angle)
        nx = cx + r * math.cos(rad)
        ny = cy + r * math.sin(rad)
        draw.ellipse([nx-8, ny-8, nx+8, ny+8], fill=a)
    # small nodes on inner ring
    for angle in [45, 135, 225, 315]:
        rad = math.radians(angle)
        nx = cx + r2 * math.cos(rad)
        ny = cy + r2 * math.sin(rad)
        draw.ellipse([nx-5, ny-5, nx+5, ny+5], fill=a)
    # center dot
    draw.ellipse([cx-15, cy-15, cx+15, cy+15], fill=a)
    # connector lines
    for angle in [45, 135, 225, 315]:
        rad = math.radians(angle)
        x1 = cx + r2 * math.cos(rad)
        y1 = cy + r2 * math.sin(rad)
        x2 = cx + r * math.cos(rad)
        y2 = cy + r * math.sin(rad)
        draw.line([x1, y1, x2, y2], fill=a, width=lw)


def draw_lightning(draw, cx, cy, accent, lw=3):
    a = accent
    pts = [
        (cx + 20, cy - 120),
        (cx - 10, cy),
        (cx + 25, cy),
        (cx - 20, cy + 120),
        (cx + 30, cy + 10),
        (cx + 5, cy + 10),
    ]
    draw.polygon(pts, fill=a)
    # glow ring
    draw.ellipse([cx-90, cy-90, cx+90, cy+90], outline=a, width=lw)


def draw_derrick(draw, cx, cy, accent, lw=4):
    a = accent
    # triangle structure (derrick)
    base = 100
    h = 180
    draw.line([cx, cy - h, cx - base, cy + 60], fill=a, width=lw)
    draw.line([cx, cy - h, cx + base, cy + 60], fill=a, width=lw)
    draw.line([cx - base, cy + 60, cx + base, cy + 60], fill=a, width=lw)
    # cross-bracing
    for i in range(1, 4):
        t = i / 4
        lx = cx - base * (1 - t)
        rx = cx + base * (1 - t)
        y = (cy - h) + (cy + 60 - (cy - h)) * t
        draw.line([lx, y, rx, y], fill=a, width=lw)
    # drill pipe going down
    draw.line([cx, cy + 60, cx, cy + 130], fill=a, width=lw * 2)
    # base platform
    draw.rectangle([cx - 120, cy + 58, cx + 120, cy + 68], fill=a)


def draw_network(draw, cx, cy, accent, lw=3):
    a = accent
    nodes = [
        (cx, cy),
        (cx - 110, cy - 80),
        (cx + 110, cy - 80),
        (cx - 110, cy + 80),
        (cx + 110, cy + 80),
        (cx, cy - 130),
    ]
    for n1 in nodes:
        for n2 in nodes:
            if n1 != n2:
                draw.line([n1, n2], fill=(*a, 60), width=lw)
    for nx, ny in nodes:
        r = 18 if (nx, ny) == (cx, cy) else 12
        draw.ellipse([nx-r, ny-r, nx+r, ny+r], fill=a)


def draw_gear(draw, cx, cy, accent, lw=3):
    a = accent
    teeth = 12
    r_outer = 110
    r_inner = 85
    r_hole = 30
    pts = []
    for i in range(teeth * 2):
        angle = math.radians(i * 360 / (teeth * 2))
        r = r_outer if i % 2 == 0 else r_inner
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(pts, outline=a, fill=None, width=lw)
    # fill body
    pts2 = []
    for i in range(teeth * 2):
        angle = math.radians(i * 360 / (teeth * 2))
        r = r_inner - 5
        pts2.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(pts2, fill=(*a, 80))
    # center hole
    draw.ellipse([cx-r_hole, cy-r_hole, cx+r_hole, cy+r_hole], fill=(0, 0, 0, 0), outline=a, width=lw)
    # spokes
    for angle_deg in [0, 60, 120, 180, 240, 300]:
        angle = math.radians(angle_deg)
        x1 = cx + r_hole * math.cos(angle)
        y1 = cy + r_hole * math.sin(angle)
        x2 = cx + (r_inner - 10) * math.cos(angle)
        y2 = cy + (r_inner - 10) * math.sin(angle)
        draw.line([x1, y1, x2, y2], fill=a, width=lw)


def draw_cabinet(draw, cx, cy, accent, lw=3):
    a = accent
    w, h = 160, 200
    # cabinet body
    draw.rectangle([cx-w//2, cy-h//2, cx+w//2, cy+h//2], outline=a, width=lw)
    # door split
    draw.line([cx, cy-h//2, cx, cy+h//2], fill=a, width=lw)
    # hinges
    for dy in [-60, 60]:
        draw.ellipse([cx-w//2-3, cy+dy-5, cx-w//2+3+6, cy+dy+5], fill=a)
        draw.ellipse([cx+w//2-9, cy+dy-5, cx+w//2+3, cy+dy+5], fill=a)
    # handle
    draw.ellipse([cx-12, cy-8, cx-4, cy+8], outline=a, width=lw)
    draw.ellipse([cx+4, cy-8, cx+12, cy+8], outline=a, width=lw)
    # indicator lights (3 LED circles)
    for i, col in enumerate([a, (*accent, 200), a]):
        lx = cx - w//2 + 20 + i * 20
        ly = cy - h//2 + 20
        draw.ellipse([lx-5, ly-5, lx+5, ly+5], fill=a)
    # bottom panel screws
    for dx in [-50, 50]:
        draw.ellipse([cx+dx-4, cy+h//2-15, cx+dx+4, cy+h//2-7], fill=a)


def draw_valve(draw, cx, cy, accent, lw=4):
    a = accent
    # horizontal pipe
    draw.rectangle([cx-130, cy-20, cx+130, cy+20], outline=a, fill=(*a, 50), width=lw)
    # valve body (diamond)
    pts = [(cx, cy-55), (cx+45, cy), (cx, cy+55), (cx-45, cy)]
    draw.polygon(pts, outline=a, fill=(*a, 80), width=lw)
    # stem
    draw.line([cx, cy-55, cx, cy-90], fill=a, width=lw)
    # handwheel
    draw.ellipse([cx-40, cy-120, cx+40, cy-80], outline=a, width=lw)
    draw.line([cx-40, cy-100, cx+40, cy-100], fill=a, width=lw)
    draw.line([cx, cy-120, cx, cy-80], fill=a, width=lw)


def draw_scada(draw, cx, cy, accent, lw=3):
    a = accent
    # monitor
    sw, sh = 220, 150
    draw.rectangle([cx-sw//2, cy-sh//2, cx+sw//2, cy+sh//2], outline=a, width=lw, fill=(*a, 20))
    # screen charts (bar chart)
    bars = [40, 70, 55, 90, 65, 50, 80]
    bw = 18
    bx = cx - len(bars) * (bw + 5) // 2
    for i, bh in enumerate(bars):
        x0 = bx + i * (bw + 5)
        y0 = cy + sh//2 - 15
        draw.rectangle([x0, y0 - bh, x0 + bw, y0], fill=a)
    # stand
    draw.rectangle([cx-15, cy+sh//2, cx+15, cy+sh//2+25], fill=a, width=lw)
    draw.rectangle([cx-50, cy+sh//2+25, cx+50, cy+sh//2+30], fill=a)


def draw_bulb(draw, cx, cy, accent, lw=4):
    a = accent
    # bulb circle
    r = 90
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=a, fill=(*a, 60), width=lw)
    # base
    draw.rectangle([cx-40, cy+r-10, cx+40, cy+r+30], outline=a, fill=(*a, 80), width=lw)
    draw.rectangle([cx-35, cy+r+30, cx+35, cy+r+50], outline=a, fill=(*a, 80), width=lw)
    # rays
    ray_len = 40
    for angle_deg in range(0, 360, 45):
        angle = math.radians(angle_deg)
        x1 = cx + (r + 10) * math.cos(angle)
        y1 = cy + (r + 10) * math.sin(angle)
        x2 = cx + (r + ray_len) * math.cos(angle)
        y2 = cy + (r + ray_len) * math.sin(angle)
        draw.line([x1, y1, x2, y2], fill=a, width=lw - 1)


def draw_cable(draw, cx, cy, accent, lw=4):
    a = accent
    # cable coil (concentric arcs)
    for r in range(40, 140, 25):
        draw.arc([cx-r, cy-r, cx+r, cy+r], start=30, end=330, fill=a, width=lw)
    # connector end left
    draw.rectangle([cx-160, cy-12, cx-130, cy+12], fill=a, outline=a, width=2)
    draw.line([cx-130, cy, cx-40, cy-80], fill=a, width=lw)
    # connector end right
    draw.rectangle([cx+130, cy-12, cx+160, cy+12], fill=a, outline=a, width=2)
    draw.line([cx+130, cy, cx+40, cy+80], fill=a, width=lw)


def draw_shield(draw, cx, cy, accent, lw=4):
    a = accent
    # shield shape
    pts = [
        (cx, cy - 120),
        (cx + 100, cy - 80),
        (cx + 100, cy + 20),
        (cx, cy + 120),
        (cx - 100, cy + 20),
        (cx - 100, cy - 80),
    ]
    draw.polygon(pts, outline=a, fill=(*a, 60), width=lw)
    # lock icon inside
    draw.rectangle([cx-25, cy-10, cx+25, cy+40], fill=a)
    draw.arc([cx-25, cy-40, cx+25, cy+10], start=180, end=0, fill=a, width=lw)
    draw.ellipse([cx-8, cy+5, cx+8, cy+20], fill=(0, 0, 0, 0), outline=(0, 0, 0), width=2)


def draw_pump(draw, cx, cy, accent, lw=4):
    a = accent
    # pump body (circle)
    r = 80
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=a, fill=(*a, 50), width=lw)
    # inlet pipe (top)
    draw.rectangle([cx-15, cy-r-60, cx+15, cy-r], fill=a, outline=a, width=lw)
    # outlet pipe (right)
    draw.rectangle([cx+r, cy-15, cx+r+60, cy+15], fill=a, outline=a, width=lw)
    # impeller spokes
    for angle_deg in range(0, 360, 60):
        angle = math.radians(angle_deg)
        x1 = cx + 15 * math.cos(angle)
        y1 = cy + 15 * math.sin(angle)
        x2 = cx + (r - 15) * math.cos(angle)
        y2 = cy + (r - 15) * math.sin(angle)
        draw.line([x1, y1, x2, y2], fill=a, width=lw)
    draw.ellipse([cx-18, cy-18, cx+18, cy+18], fill=a)
    # motor (right box)
    draw.rectangle([cx+r+60, cy-35, cx+r+120, cy+35], outline=a, fill=(*a, 40), width=lw)


def draw_filter(draw, cx, cy, accent, lw=4):
    a = accent
    # funnel top
    draw.polygon([(cx-120, cy-80), (cx+120, cy-80), (cx+40, cy+20), (cx-40, cy+20)], outline=a, fill=(*a, 50), width=lw)
    # tube
    draw.rectangle([cx-40, cy+20, cx+40, cy+100], outline=a, fill=(*a, 50), width=lw)
    # filter lines inside
    for i, dy in enumerate([-50, -20, 10]):
        t = i / 3
        w2 = int(100 - 50 * t)
        draw.line([cx-w2, cy+dy, cx+w2, cy+dy], fill=a, width=lw)
    # drops
    for dx in [-15, 0, 15]:
        draw.ellipse([cx+dx-5, cy+110, cx+dx+5, cy+130], fill=a)


def draw_explosion(draw, cx, cy, accent, lw=4):
    a = accent
    # hazard triangle
    pts = [(cx, cy - 130), (cx + 120, cy + 70), (cx - 120, cy + 70)]
    draw.polygon(pts, outline=a, fill=(*a, 40), width=lw)
    # EX text (manually drawn with rectangles/lines)
    # "!" exclamation mark inside
    draw.rectangle([cx-8, cy-55, cx+8, cy+25], fill=a)
    draw.ellipse([cx-8, cy+35, cx+8, cy+55], fill=a)
    # sparks around
    for angle_deg in range(0, 360, 72):
        angle = math.radians(angle_deg)
        r1, r2 = 140, 170
        x1 = cx + r1 * math.cos(angle)
        y1 = cy - 20 + r1 * math.sin(angle)
        x2 = cx + r2 * math.cos(angle + 0.3)
        y2 = cy - 20 + r2 * math.sin(angle + 0.3)
        draw.line([x1, y1, x2, y2], fill=a, width=3)


def draw_gauge(draw, cx, cy, accent, lw=4):
    a = accent
    # outer ring
    r = 110
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=a, fill=(*a, 30), width=lw)
    # inner ring
    r2 = 95
    draw.ellipse([cx-r2, cy-r2, cx+r2, cy+r2], outline=a, width=2)
    # tick marks
    for angle_deg in range(-135, 136, 27):
        angle = math.radians(angle_deg)
        x1 = cx + r2 * math.cos(angle)
        y1 = cy + r2 * math.sin(angle)
        x2 = cx + (r2 - 18) * math.cos(angle)
        y2 = cy + (r2 - 18) * math.sin(angle)
        draw.line([x1, y1, x2, y2], fill=a, width=3)
    # needle (pointing to ~60% of scale)
    needle_angle = math.radians(-135 + 270 * 0.65)
    nx = cx + (r2 - 25) * math.cos(needle_angle)
    ny = cy + (r2 - 25) * math.sin(needle_angle)
    draw.line([cx, cy, nx, ny], fill=a, width=5)
    # center cap
    draw.ellipse([cx-10, cy-10, cx+10, cy+10], fill=a)
    # label zone
    draw.arc([cx-r2+5, cy-r2+5, cx+r2-5, cy+r2-5], start=135, end=45, fill=a, width=3)


ICON_FUNCS = {
    "circuit": draw_circuit,
    "lightning": draw_lightning,
    "derrick": draw_derrick,
    "network": draw_network,
    "gear": draw_gear,
    "cabinet": draw_cabinet,
    "valve": draw_valve,
    "scada": draw_scada,
    "bulb": draw_bulb,
    "cable": draw_cable,
    "shield": draw_shield,
    "pump": draw_pump,
    "filter": draw_filter,
    "explosion": draw_explosion,
    "gauge": draw_gauge,
}


# ─── Generate single category image ────────────────────────────────────────────
def generate_image(cat: dict) -> bytes:
    img = Image.new("RGB", (IMG_W, IMG_H))
    draw_gradient(img, cat["colors"][0], cat["colors"][1])

    # dots overlay on RGBA layer
    overlay = Image.new("RGBA", (IMG_W, IMG_H), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    draw_dots(ov_draw, cat["accent"])
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

    # diagonal light stripe
    stripe = Image.new("RGBA", (IMG_W, IMG_H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(stripe)
    sd.polygon([(0, 0), (IMG_W // 2, 0), (0, IMG_H // 2)], fill=(255, 255, 255, 12))
    img = Image.alpha_composite(img.convert("RGBA"), stripe).convert("RGB")

    draw = ImageDraw.Draw(img)

    # accent line at top
    accent = cat["accent"]
    draw.rectangle([0, 0, IMG_W, 4], fill=accent)

    # draw icon (centered slightly up)
    icon_fn = ICON_FUNCS.get(cat["icon"])
    if icon_fn:
        icon_fn(draw, IMG_W // 2, IMG_H // 2 - 30, accent)

    # subtle bottom panel
    draw.rectangle([0, IMG_H - 100, IMG_W, IMG_H], fill=(0, 0, 0))
    draw.rectangle([0, IMG_H - 100, IMG_W, IMG_H - 97], fill=accent)

    # category name
    try:
        font_big = ImageFont.truetype(FONT_BOLD, 26)
        font_sm = ImageFont.truetype(FONT_LIGHT, 16)
    except Exception:
        font_big = ImageFont.load_default()
        font_sm = font_big

    name = cat["name_uz"]
    if len(name) > 48:
        mid = name.rfind(" ", 0, 48)
        line1 = name[:mid]
        line2 = name[mid + 1:]
    else:
        line1 = name
        line2 = ""

    draw.text((30, IMG_H - 88), line1, fill="white", font=font_big)
    if line2:
        draw.text((30, IMG_H - 58), line2, fill=(200, 200, 200), font=font_sm)

    # brand watermark
    draw.text((IMG_W - 180, IMG_H - 28), "dynamics-market.uz", fill=(120, 120, 120), font=font_sm)

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    buf.seek(0)
    return buf.read()


# ─── Upload image to production API ────────────────────────────────────────────
def upload_image(img_bytes: bytes, filename: str) -> dict:
    files = {"file": (filename, img_bytes, "image/png")}
    resp = requests.post(UPLOAD_URL, files=files, timeout=30, verify=False)
    resp.raise_for_status()
    data = resp.json()
    return data["files"][0]


# ─── Main ───────────────────────────────────────────────────────────────────────
def main():
    client = MongoClient(MONGO_URI)
    db = client["dynamics_market"]

    top_cats = list(db.categories.find(
        {"parentId": None, "isDeleted": False},
        {"_id": 1, "nameUz": 1}
    ))

    print(f"\nTop-level kategoriyalar soni: {len(top_cats)}\n")

    # build lookup: nameUz → config
    config_map = {c["name_uz"]: c for c in CATEGORIES}

    updated = 0
    skipped = 0

    for cat_doc in top_cats:
        name = cat_doc["nameUz"]
        cat_id = cat_doc["_id"]

        cfg = config_map.get(name)
        if not cfg:
            print(f"  ⚠  Config topilmadi: {name[:60]}")
            skipped += 1
            continue

        print(f"  ⏳ Generatsiya: {name[:60]}")
        img_bytes = generate_image(cfg)
        filename = f"category-{cfg['slug']}.png"

        print(f"     ↑ Upload qilinmoqda...")
        file_meta = upload_image(img_bytes, filename)

        # build FileMetadata object matching schema
        image_obj = {
            "fieldname": file_meta.get("fieldname", "file"),
            "originalname": file_meta.get("originalname", filename),
            "encoding": file_meta.get("encoding", "7bit"),
            "mimetype": file_meta.get("mimetype", "image/png"),
            "destination": file_meta.get("destination", "uploads"),
            "filename": file_meta.get("filename", filename),
            "path": file_meta.get("path", f"uploads/{filename}"),
            "size": file_meta.get("size", 0),
            "extension": "png",
        }

        db.categories.update_one(
            {"_id": cat_id},
            {"$set": {
                "image": image_obj,
                "images": [image_obj],
            }}
        )
        updated += 1
        print(f"     ✓ Yangilandi → {image_obj['path']}\n")

    print(f"\n{'='*60}")
    print(f"Yangilandi: {updated} ta | O'tkazib yuborildi: {skipped} ta")
    client.close()


if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings()
    main()
