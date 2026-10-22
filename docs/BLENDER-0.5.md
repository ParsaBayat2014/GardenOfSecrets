# Blender art iteration 0.5

This is an incremental art prototype, not a claim of reference-image quality. The supplied promotional image guided color, lighting and stylized proportions; none of its pixels or character design is embedded in the game.

Run Blender 5 with --background --factory-startup --python tools/blender/build-premium.py to create three longer-proportioned characters. Character surfaces use interpolated lofts, voxel-welded clothing/face volumes, smoothed normals, weighted deformation and eye/mouth morph targets. Each character has an editable bind-pose master and a separate posed studio scene, plus full-body and close-up renders in art-source/renders. Runtime GLBs ending -premium.glb load by default; previous source masters are retained. The shared KayKit skeleton and source animation retain their existing CC0 attribution. No Rain or other Blender Studio model is included.

The runtime retargeter offsets animated translations and orientations relative to source/target bind poses; this preserves the new proportions. Unit checks cover offsets, orientation and preservation of source clips. Browser checks cover all three face targets, walking knee motion, pause/resume, all 26 discoveries, three locks and the ending. Android build, lint and APK signing must pass for release; physical phone testing is still outstanding.

The separate garden-story-art.blend scene uses the same original garden and hero meshes, with three area lights, depth of field and modeled emissive fireflies. The render is a development key-art draft, not a screenshot of mobile gameplay. Run tools/blender/render-story-art.py after building the characters to reproduce it.

Commercial illustration polish, richer expressions, texture painting, film-quality anatomy and broad device coverage remain unfinished.
