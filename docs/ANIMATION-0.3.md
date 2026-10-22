# Animation 0.3 — verified build, 2026-10-22

This remains a first-chapter prototype. No commercial visual parity or absence of all defects is claimed.

Changes: eight-frame original walk atlas, distance-driven steps, authored floor routes, preserved facing on vertical segments, gentle idle motion, stable dialogue poses, separate speaker/listener portraits and side inventory that leaves the foreground visible. Canvas effects account for device pixel density. Backgrounding pauses locomotion instead of jumping to its endpoint.

Passed: complete chapter by touch at 915×412 and 740×360; locks, 12-click spam, inventory, story scenes, epilogue, fast travel, save/reload, reduced motion, replay and NPC chat. Focused checks cover persistent choices, blocked background interaction, stable portrait pixels and a paused/resumed walk. Motion checks cover routes, monotonic distance, vertical facing and stationary actions.

Android release assembly and lint passed (two warnings: fixed landscape orientation and data extraction rules). APK signature verified; package ir.toosarax.gardensecrets, version 0.3.0/code 3, Android 7+. Bundled animation code and both new atlases match current source byte for byte.

APK: dist/GardenOfSecrets-0.3.0-release.apk
SHA256: df4672aa0ce83d6b6f3bada99e29a444812c3ec54b7fe17588a5016dd81a146c

Physical-device installation/performance and Myket submission remain unverified. No voice acting, skeletal 3D animation or additional story chapter was added.

Artwork: app/src/main/assets/art/characters/walk-v3.webp is extracted from a new built-in ImageGen transparent sheet. Local master: artwork/characters/raha-walk-v3.png. portraits-v3.webp reframes existing original characters; attempted new portraits were not used. Extraction is reproducible with tools/pack-polish.py when local masters are present. The runtime atlases are included in source.

Walk generation prompt (built-in mode):
Use case: illustration-story. Asset: production 2D game walk-cycle sprite atlas on TRUE TRANSPARENT alpha background, 4 columns by 2 rows, exactly EIGHT full body drawings, no text or borders. Reference image is original character Raha identity and costume reference only. Preserve her warm olive skin, long dark brown braid, terracotta jacket, ivory blouse, teal loose trousers, brown boots and brown satchel. Create a clean polished casual mobile adventure game 3D-rendered cartoon character, appealing adult young woman, consistent anatomy and face. EVERY cell same character at EXACT SAME SCALE with feet at SAME baseline and head same height, fixed camera THREE QUARTER SIDE VIEW FACING RIGHT, eyes open throughout, no turn toward camera, no pose or costume changes. Eight ordered frames of ONE continuous seamless NATURAL WALK cycle, row-major: right heel contact/left toe off; right down; right passing with left knee moving through; right up; left heel contact/right toe off; left down; left passing/right knee through; left up. Opposing arm swing, small stable head motion, boots visibly change contact leg. Walk in place, center pelvis fixed in each cell, never translate across a cell. No props except attached satchel. All eight frames completely contained inside equal cells with generous transparent gutters. Do not clip hands or feet. Professional clean silhouette with no background contamination, clean alpha edges, no black outlines, no shadows on background. This must be a coherent animation sequence, not eight unrelated poses. Large landscape sheet aspect 2:1.
