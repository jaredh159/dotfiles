---
description: Load and view photos airdropped from iPhone
---

Jared is about to start sending photos from his iPhone via AirDrop. These arrive as
`.HEIC` files in `~/Downloads`.

## Steps

### 1. Find the newest HEIC files

```bash
ls -lt ~/Downloads/*.HEIC ~/Downloads/*.heic 2>/dev/null | head -10
```

Ask the user how many recent photos to look at if not specified. There might be a bunch,
the ones you want are probably the most recent, from today's date..

### 2. Convert to JPEG for viewing

HEIC files are too large to read directly. Convert with `sips`:

```bash
sips -s format jpeg ~/Downloads/IMG_XXXX.HEIC --out /tmp/IMG_XXXX.jpg -Z 2048
```

`-Z 2048` constrains the longest edge to 2048px, keeping file size manageable.

### 3. View with the Read tool

Use the Read tool on the converted `/tmp/*.jpg` files. Read supports images natively.

### Notes

- Convert and read multiple images in parallel when possible.
- HEIC files are sorted by modification time; newest first.
- Converted files go in `/tmp` to avoid cluttering Downloads.
