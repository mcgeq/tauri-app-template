# Support Matrix

| Target | Status | Notes |
|---|---|---|
| Windows desktop | Productized in template | Primary packaged target with NSIS + updater artifacts and documented release flow |
| macOS desktop | Build-verified in CI | Desktop build lane exists, but signing, notarization, and app distribution remain downstream work |
| Linux desktop | Build-verified in CI | Desktop build lane exists, but packaging and distribution remain downstream work |
| Android | Supported for local development/build | `build.ps1` supports dev, debug APK, and release APK flows, but no hosted mobile release pipeline is included |
| iOS | Experimental / not productized | Config scaffolding exists, but no local script or CI packaging path is included yet |
