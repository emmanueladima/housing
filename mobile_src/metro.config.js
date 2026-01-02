const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Force Metro to resolve modules strictly from the mobile directory
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];

// Disable auto-resolving from parent directories
config.resolver.disableHierarchicalLookup = true;

// Ensure we only watch the mobile folder
config.watchFolders = [projectRoot];

module.exports = config;
