# Electron Builder Packaging, Windows Targets & Code Signing

## 1. Distribution Targets
Open Print Studio targets Windows 10/11 x64 systems common in Indian CSCs and cyber cafes:
- **NSIS Installer (`.exe`):** Single-file wizard for standard retail installation with desktop shortcuts.
- **Portable Executable (`.exe`):** Zero-install standalone binary for locked PCs or restricted admin environments.
- **Linux AppImage / deb:** Secondary target for government CSC centers running BOSS Linux or Ubuntu.

## 2. Configuration Sample (`electron-builder.json5`)
```json5
{
  appId: "org.openprintstudio.app",
  productName: "Open Print Studio",
  directories: {
    output: "release",
    buildResources: "build"
  },
  files: [
    "dist/**/*",
    "electron/**/*",
    "public/**/*"
  ],
  win: {
    target: [
      { target: "nsis", arch: ["x64"] },
      { target: "portable", arch: ["x64"] }
    ],
    icon: "build/icon.ico",
    artifactName: "${productName}-Setup-${version}.${ext}"
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  }
}
```

## 3. Code Signing & SmartScreen Notes
- For commercial releases, sign the binary using an EV Code Signing Certificate or Microsoft Trusted Signing to prevent Windows Defender SmartScreen warnings.
- In offline environments without internet access, SmartScreen validation relies on local certificate authority root trust.

## 4. Opt-in Update Policy
- Automatic background downloading of updates is strictly prohibited.
- An optional "Check for Updates" menu item queries GitHub Releases only when explicitly clicked by the operator, displaying release notes and allowing manual download.
