"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWindowConfig = exports.getConfig = void 0;
const vscode = require("vscode");
/**
 * Helper function for getting the config for this extension for a resource.
 * @returns The config for this extension
 * @param resourceUri The uri of the resource we are getting the config for.
 */
function getConfig(resourceUri) {
    return vscode.workspace.getConfiguration("C/C++ Include Guard", resourceUri);
}
exports.getConfig = getConfig;
/**
 * Helper function for getting the config for this extension in window scope.
 * @returns The config for this extension
 */
function getWindowConfig() {
    return vscode.workspace.getConfiguration("C/C++ Include Guard");
}
exports.getWindowConfig = getWindowConfig;
//# sourceMappingURL=common.js.map