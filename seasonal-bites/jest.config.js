// jest.config.js
module.exports = {
    preset: "jest-expo",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    transform: {
      "^.+\\.(js|ts|tsx)$": "babel-jest",
    },
    transformIgnorePatterns: [
      "node_modules/(?!(react-native|@react-native|react-native-toast-message|@react-native/js-polyfills|expo|@expo|expo-sqlite|expo-asset|expo-constants|expo-modules-core)/)"
    ],
    setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
    globals: {
      "process.env.EXPO_OS": "web"
    }
  };
  