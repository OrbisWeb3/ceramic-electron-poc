const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const { APPLICATION_PROTOCOL } = require("./electron/app.config.cjs");

module.exports = {
  packagerConfig: {
    asar: true,
    protocols: [
      // Register the protocol for MacOS
      // Format the name using protocol (split by "-" and title case)
      {
        name: APPLICATION_PROTOCOL.split("-")
          .map(
            (word) => (word && word[0].toUpperCase() + word.slice(1)) || word
          )
          .join(" "),
        schemes: [APPLICATION_PROTOCOL],
      },
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        // Register the protocol on Linux
        mimeType: [`x-scheme-handler/${APPLICATION_PROTOCOL}`],
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
