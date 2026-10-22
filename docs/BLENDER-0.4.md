# Blender 0.4 production files

Seven editable Blender 5 master files live in art-source/blender: garden, shed, green, archive, raha, sohrab and saman. Runtime models are exported to app/src/main/assets/rebuild/models/blender. The classic illustrated version remains accessible from the menu and uses a separate save key.

Reproduce architecture: node tools/blender/export-blockouts.mjs followed by Blender --background --python tools/blender/build-environments.py -- all. Reproduce weighted character meshes: Blender --background --python tools/blender/build-characters.py. Character surfaces originate from the project's procedural character design; Blender binds these surfaces into skinned meshes. This is not a new hand-sculpted cinematic character set. Architectural embellishment, tile roofs, roses, ivy and room details are authored by the Blender script. KayKit skeletal rigs and animation are credited under CC0 in rebuild/licenses; Three.js is MIT.

Verification: complete chapter browser traversal, articulated knee movement, walking, pause/resume, independent legacy save and navigation checks. Android release build and lint are required after asset changes. No physical Android device has been tested. Myket submission has not occurred. The build is a one-chapter prototype, not a guarantee of commercial quality or absence of all bugs.
