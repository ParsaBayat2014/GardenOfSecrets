# راز باغ فیروزه — Garden of Secrets

An original offline Persian story puzzle game for Android. Chapter one follows Raha through a garden, gardener's shed, greenhouse and family archive: discover a hidden key, read clues, repair an axe, unlock three combination puzzles and recover the garden deed. Includes 26 discoveries, inventory, local saves, hints and three decorative renovations.

This is a playable **0.1.0 first-chapter prototype**, not a full commercial game. It is not affiliated with or endorsed by Bagh Negar. Its story and environment art are original to this project; the existing environment illustrations were generated with AI. No visual parity with a commercial title is claimed.

## Play on Android

Download the signed APK from this repository's Releases page, transfer it to your phone and open it. Android may ask you to allow installation from that download source. Requires Android 7.0 or later. Play in landscape. No account, internet permission, advertising, billing or analytics. Progress stays on the device; uninstalling removes it.

## Build and verify

Use JDK 17, Gradle 8.7 and Android SDK 34. Set `sdk.dir` in local.properties. The included Windows build helper uses the local D:/AndroidToolchain paths; adapt these for your machine. For a debug build use `gradle :app:assembleDebug`. For a signed release create your own `signing/release.properties` containing storeFile, storePassword, keyAlias and keyPassword; signing files must never be committed. Keep the original release key backed up for future updates.

`npm test` verifies the complete story model, invalid actions and save recovery. `node tools/test-ui.cjs` verifies the chapter by touch in a local browser; it requires Playwright and the Chrome executable configured in that file. `gradle :app:assembleRelease :app:lintRelease` builds and checks Android.

## Publication status

This source and its signed prototype APK are public. No submission to Myket has been made. A Myket developer account, listing assets, device testing and review of current store requirements are still needed before submission. See docs/QA.md and docs/MYKET.md.

## Assets and source

The Vazirmatn font is distributed under the SIL Open Font License; see app/src/main/assets/art/OFL.txt. The source and original game assets have no additional license grant at present; public visibility alone does not grant redistribution rights. Third-party font licensing remains as supplied.
