---
description: Load and view photos airdropped from iPhone
---

Jared is about to start sending photos from his iPhone via AirDrop. These arrive as
`.HEIC` files (photos) or `.PNG` files (screenshots) in `~/Downloads`.

## Steps

### 1. Find the most recently added image files

AirDropped files preserve their original creation/modification dates, so sorting by
modification time will NOT find recently AirDropped files. Instead, use macOS Spotlight
metadata (`kMDItemDateAdded`) which tracks when the file was added to the folder:

```bash
for f in ~/Downloads/*.HEIC ~/Downloads/*.heic ~/Downloads/*.PNG ~/Downloads/*.png; do
  [ -f "$f" ] && echo "$(mdls -name kMDItemDateAdded -raw "$f") $f"
done 2>/dev/null | sort -r | head -10
```

Ask the user how many recent photos to look at if not specified.

### 2. Convert for viewing

HEIC files are too large to read directly. Convert with `sips`:

```bash
sips -s format jpeg ~/Downloads/IMG_XXXX.HEIC --out /tmp/IMG_XXXX.jpg -Z 2048
```

`-Z 2048` constrains the longest edge to 2048px, keeping file size manageable.

PNG screenshots can usually be read directly, but if they're large, downsize with:

```bash
sips -Z 2048 ~/Downloads/IMG_XXXX.PNG --out /tmp/IMG_XXXX.png
```

### 3. View with the Read tool

Use the Read tool on the converted `/tmp/` files. Read supports images natively.

### Notes

- Convert and read multiple images in parallel when possible.
- Files are sorted by Finder "date added" (kMDItemDateAdded); newest first.
- Converted files go in `/tmp` to avoid cluttering Downloads.
