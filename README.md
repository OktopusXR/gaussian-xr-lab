# Gaussian XR Lab

Experimental WebXR laboratory by OktopusXR. Built with XR Blocks and Three.js.

## Current milestone
- XR Blocks baseline scene with an interactive object.
- VR/MR capability checks (device and browser dependent).
- Asset directories for equirectangular panoramas, 360 videos, GLB models and Gaussian Splats.
- GitHub Pages deployment workflow.

## Local development
Serve the repository root over HTTP(S), for example `python3 -m http.server 8080`, and open `http://localhost:8080`. Immersive WebXR requires HTTPS or localhost and a compatible browser/headset.

## Assets
Place media in `assets/panoramas/`, `assets/videos360/`, `assets/models/`, and `assets/splats/`. Large original videos should stay outside Git history. Asset paths can be registered in `assets/manifest.json`.

## Roadmap
1. Validate Quest 3 VR and passthrough MR.
2. Add equirectangular viewer and GLB loading.
3. Evaluate Spark Gaussian Splat renderer and test formats/performance.
4. Test Android AR separately; support varies by browser and hardware.

XR Blocks reference: https://github.com/google/xrblocks
