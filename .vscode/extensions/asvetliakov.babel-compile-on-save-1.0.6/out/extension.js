"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const micromatch_1 = __importDefault(require("micromatch"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const vscode_languageclient_1 = require("vscode-languageclient");
function findPackageJson(sourceDir, workspacePath) {
    const root = path_1.default.parse(sourceDir).root;
    let step = sourceDir;
    while (!fs_1.default.existsSync(path_1.default.join(step, "package.json")) && step !== workspacePath && step !== root) {
        step = path_1.default.resolve(step, "../");
    }
    return step;
}
function saveListener(e, output, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(e.uri);
        if (!workspaceFolder || workspaceFolder.uri.scheme !== "file") {
            return;
        }
        const workspacePath = workspaceFolder.uri.fsPath;
        const config = vscode.workspace.getConfiguration("babel-compile-on-save", e.uri);
        const fileName = e.fileName;
        if (!config || !fileName) {
            return;
        }
        const includeGlobs = config.get("include", []).map((g) => `${workspacePath}/${g}`);
        // micromatch supports glob array, bad typings
        if (!micromatch_1.default.isMatch(fileName, includeGlobs)) {
            return;
        }
        // always skip d.ts files
        if (fileName.endsWith(".d.ts")) {
            return;
        }
        const projectPath = findPackageJson(path_1.default.dirname(fileName), workspacePath);
        const outDir = config.get("outDir", "");
        const srcDir = config.get("srcDir", "");
        const outExt = config.get("outExt", ".js");
        const emitTSDeclaration = config.get("emitTSDeclaration", false);
        const emitTSDeclarationMap = config.get("emitTSDeclarationMap", true);
        // const outFilePath = path.resolve(workspacePath, outDir, vscode.workspace.asRelativePath(fileName, false));
        const outFilePath = path_1.default.resolve(projectPath, outDir, path_1.default.relative(path_1.default.join(projectPath, srcDir), fileName));
        const outFilePathJs = path_1.default.join(path_1.default.dirname(outFilePath), path_1.default.basename(outFilePath, path_1.default.extname(outFilePath)) + outExt);
        output.appendLine(`Compiling file: ${fileName}, output file: ${outFilePathJs}`);
        const message = {
            compileTS: emitTSDeclaration,
            emitTSDeclarationMap,
            fileName: fileName,
            outFileName: outFilePathJs,
        };
        client.sendRequest("babelCompileOnSave", message);
    });
}
let client;
function activate(context) {
    const channel = vscode.window.createOutputChannel("Babel Compile On Save");
    const serverModule = context.asAbsolutePath(path_1.default.join("out", "compile_process.js"));
    const serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
        debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
    };
    client = new vscode_languageclient_1.LanguageClient("BabelCompileOnSaveProcess", serverOptions, {
        outputChannel: channel,
        documentSelector: [
            { scheme: "file", language: "javascript" },
            { scheme: "file", language: "typescript" },
            { scheme: "file", language: "javascriptreact" },
            { scheme: "file", language: "typescriptreact" },
        ],
    });
    const clientDisp = client.start();
    const disposable = vscode.workspace.onDidSaveTextDocument((e) => saveListener(e, channel, client));
    context.subscriptions.push(disposable, channel, clientDisp);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    if (client) {
        client.stop();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map