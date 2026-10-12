# Asset conventions

Register entries in `assets/manifest.json` under `panoramas`, `videos360`, `models`, or `splats`.

Each item: `{"id":"forest","label":"Bosque","path":"assets/panoramas/forest.jpg"}`.

For panoramas use 2:1 equirectangular JPEG/WebP; 360 video must be verified as equirectangular (2:1), encoded for browser playback. For models use .glb. Splat support is reserved until a compatible renderer has been integrated and tested in XR.

Keep originals in external storage; publish only optimized derivatives. Do not commit copyrighted or private assets without approval. Video files over 100 MB cannot be pushed through GitHub's regular Contents API.

## Test
Open the Pages URL on a Quest 3 browser. Check immersive VR and MR independently. On unsupported browsers the desktop 3D preview should remain accessible.

## First validated capture — testGaussian1.mp4
Source: Google Drive file 13MChbPfCHqbhYhf8NAulP9y8eiUX0r6c.
Verified: 5760x2880, 2:1 equirectangular, HEVC, 30 fps, duration 1.57 s.
A browser-compatible H.264 derivative at 2880x1440 was generated separately. It has NOT yet been committed or hosted. After uploading the derivative to assets/videos360/bosque_webxr.mp4, register:
```json
{"id":"bosque","label":"Bosque 360","path":"assets/videos360/bosque_webxr.mp4"}
```
under videos360 in assets/manifest.json.
