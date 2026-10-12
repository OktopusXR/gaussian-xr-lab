# Asset conventions

Register entries in `assets/manifest.json` under `panoramas`, `videos360`, `models`, or `splats`.

Each item: `{"id":"forest","label":"Bosque","path":"assets/panoramas/forest.jpg"}`.

For panoramas use 2:1 equirectangular JPEG/WebP; 360 video must be verified as equirectangular (2:1), encoded for browser playback. For models use .glb. Splat support is reserved until a compatible renderer has been integrated and tested in XR.

Keep originals in external storage; publish only optimized derivatives. Do not commit copyrighted or private assets without approval. Video files over 100 MB cannot be pushed through GitHub's regular Contents API.

## Test
Open the Pages URL on a Quest 3 browser. Check immersive VR and MR independently. On unsupported browsers the desktop 3D preview should remain accessible.
