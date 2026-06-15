# mobile/ — reserved

This directory is **reserved** for the Studio Suite React Native app.

It is intentionally empty in task 01.0.0 (the backend + web foundation). The Expo
app shell and the EAS Update OTA pipeline are scaffolded in **task 01.1.0**
(`InstructionalPrompt_01.1.0`), which depends on 01.0.0 being on `main`.

Planned toolchain (per the owner's established Expo baseline, ratified at Phase 0):

- Expo SDK 55 / React Native 0.83.2 / React 19.2, TypeScript
- NativeWind / react-native-css for locally built Tailwind (never CDN)
- EAS Build (cloud-side) + EAS Update for over-the-air delivery
- Targets: iOS + Android

Do not add app code here in task 01.0.0.
