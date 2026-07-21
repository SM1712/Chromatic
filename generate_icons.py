import os
import math
from PIL import Image, ImageDraw

def create_chromatic_icon(size):
    # High resolution canvas for smooth anti-aliased rendering
    scale = 4
    canvas_size = size * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = int(canvas_size * 0.04)
    badge_rect = [margin, margin, canvas_size - margin, canvas_size - margin]
    corner_radius = int(canvas_size * 0.25)

    # 1. White Background Container Badge
    draw.rounded_rectangle(badge_rect, radius=corner_radius, fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=int(scale * 1.5))

    # Center of badge
    center_x = canvas_size / 2.0
    center_y = canvas_size / 2.0

    # Colors for the 6 blades (Blue, Violet, Fuchsia, Coral, Amber, Emerald)
    colors = [
        (37, 99, 235, 255),   # Blue #2563EB
        (124, 58, 237, 255),  # Violet #7C3AED
        (236, 72, 153, 255),  # Fuchsia #EC4899
        (239, 68, 68, 255),   # Coral #EF4444
        (245, 158, 11, 255),  # Amber #F59E0B
        (16, 185, 129, 255)   # Emerald #10B981
    ]

    # Template polygon blade relative to center (32, 32) in 64x64 unit space
    # Base points: (29, 25), (47, 19), (49, 35), (36, 35)
    unit_base_points = [
        (29 - 32, 25 - 32),
        (47 - 32, 19 - 32),
        (49 - 32, 35 - 32),
        (36 - 32, 35 - 32)
    ]

    factor = (canvas_size / 64.0)

    # Draw 6 rotated blades
    for i in range(6):
        angle_rad = math.radians(i * 60.0)
        cos_a = math.cos(angle_rad)
        sin_a = math.sin(angle_rad)

        poly_points = []
        for dx, dy in unit_base_points:
            rx = dx * factor
            ry = dy * factor
            # Rotate point around center
            tx = rx * cos_a - ry * sin_a + center_x
            ty = rx * sin_a + ry * cos_a + center_y
            poly_points.append((tx, ty))

        draw.polygon(poly_points, fill=colors[i])

    # 3. Central Focal Lens Opening
    outer_r = 7.5 * factor
    inner_r = 3.8 * factor

    draw.ellipse([center_x - outer_r, center_y - outer_r, center_x + outer_r, center_y + outer_r], fill=(255, 255, 255, 255))
    draw.ellipse([center_x - inner_r, center_y - inner_r, center_x + inner_r, center_y + inner_r], fill=(15, 23, 42, 255))

    # Resize down with Lanczos anti-aliasing for supreme quality
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    return resized

def generate_all_tauri_icons():
    output_dir = os.path.join("src-tauri", "icons")
    os.makedirs(output_dir, exist_ok=True)

    print(f"Generando iconos de Tauri en {output_dir}...")

    # Standard Tauri icons
    icon_32 = create_chromatic_icon(32)
    icon_32.save(os.path.join(output_dir, "32x32.png"))

    icon_128 = create_chromatic_icon(128)
    icon_128.save(os.path.join(output_dir, "128x128.png"))

    icon_256 = create_chromatic_icon(256)
    icon_256.save(os.path.join(output_dir, "128x128@2x.png"))

    icon_512 = create_chromatic_icon(512)
    icon_512.save(os.path.join(output_dir, "icon.png"))

    # Save ICO for Windows
    icon_32.save(
        os.path.join(output_dir, "icon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    )

    # Save ICNS fallback for MacOS
    icon_512.save(os.path.join(output_dir, "icon.icns"), format="PNG")

    # Additional Square Windows Logos
    square_sizes = [30, 44, 71, 89, 107, 142, 150, 284, 310]
    for s in square_sizes:
        sq_img = create_chromatic_icon(s)
        sq_img.save(os.path.join(output_dir, f"Square{s}x{s}Logo.png"))

    store_img = create_chromatic_icon(50)
    store_img.save(os.path.join(output_dir, "StoreLogo.png"))

    print("[SUCCESS] Todos los iconos generados exitosamente en src-tauri/icons/")

if __name__ == "__main__":
    generate_all_tauri_icons()
