"use strict";
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
const vscode_languageserver_1 = require("vscode-languageserver");
const path_1 = __importDefault(require("path"));
const make_dir_1 = __importDefault(require("make-dir"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
const promisedWriteFile = util_1.promisify(fs_1.default.writeFile);
const parseConfigHost = {
    fileExists: fs_1.default.existsSync,
    getCurrentDirectory: () => __dirname,
    readFile: (path) => fs_1.default.readFileSync(path, { encoding: "utf8" }),
    onUnRecoverableConfigFileDiagnostic: (diag) => {
        throw new Error("Error when parsing TS config file: " + diag.messageText.toString());
    },
    // we don't need any directory reading
    readDirectory: () => [],
    useCaseSensitiveFileNames: true,
};
/**
 * Compile TS declaration. Creates program only with single sourcefile and tries to get the declaration for it
 * @param filePath File path
 */
function compileTypescript(filePath, emitMap = true) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) {
            return;
        }
        let tsPath;
        try {
            tsPath = require.resolve("typescript", {
                paths: [path_1.default.dirname(filePath), __dirname],
            });
        }
        catch (_a) {
            throw new Error("Unable to instantiate typescript");
        }
        const ts = require(tsPath);
        const configPath = ts.findConfigFile(filePath, parseConfigHost.fileExists);
        if (!configPath) {
            return;
        }
        const parsedConfig = ts.getParsedCommandLineOfConfigFile(configPath, {
            declaration: true,
            declarationMap: emitMap,
            emitDeclarationOnly: true,
            isolatedModules: false,
            composite: false,
            skipLibCheck: true,
            noEmitHelpers: true,
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.ESNext,
            noEmit: false,
            // 2-2.5x emitting faster 250-300ms vs 600-700ms
            // unfortunately declaration could be wrong without it
            // noResolve: true,
            // skip any errors since with noResolve it will be a bunch of them
            noEmitOnError: false,
        }, parseConfigHost);
        if (!parsedConfig) {
            throw new Error(`Unable to parse TS config ${configPath}`);
        }
        const program = ts.createProgram({
            options: parsedConfig.options,
            rootNames: [filePath],
        });
        program.emit();
    });
}
const SOURCEMAP_REGEX = /^\s*\/\/#\s*sourceMappingURL/m;
/**
 * Compiles file through babel
 * @param filePath Input file path
 * @param outputPath Output file path
 */
function compileBabel(filePath, outputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const sourceFileName = path_1.default.relative(path_1.default.dirname(outputPath), filePath);
        // require @babel/core
        let babelPath;
        try {
            babelPath = require.resolve("@babel/core", {
                paths: [path_1.default.dirname(filePath), __dirname],
            });
        }
        catch (_a) {
            throw new Error("Unable to instantiate @babel/core");
        }
        const babel = require(babelPath);
        const res = yield babel.transformFileAsync(filePath, {
            root: filePath,
            rootMode: "upward",
            sourceFileName,
        });
        // babel may return empty file and it's valid case, for example TS file with only declared types
        if (!res) {
            throw new Error(`Got empty result when transipling the file: ${filePath}`);
        }
        const outputMapPath = outputPath + ".map";
        let code = res.code || "";
        const map = res.map;
        // make sure that output directory exists
        yield make_dir_1.default(path_1.default.dirname(outputPath));
        // add sourcemapping url if there is no sourcemap in the code
        const hasSourceMapping = SOURCEMAP_REGEX.test(code || "");
        if (!hasSourceMapping && map) {
            code += `\n//# sourceMappingURL=${path_1.default.basename(outputMapPath)}`;
        }
        yield Promise.all([
            promisedWriteFile(outputPath, code, { encoding: "utf8" }),
            map
                ? promisedWriteFile(outputMapPath, JSON.stringify(map), {
                    encoding: "utf8",
                })
                : Promise.resolve(),
        ]);
    });
}
connection.onInitialize((params) => {
    return {
        capabilities: {
            textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.None,
        },
    };
});
connection.onRequest("babelCompileOnSave", (param) => __awaiter(void 0, void 0, void 0, function* () {
    if (!param || !param.fileName) {
        return;
    }
    const { compileTS, emitTSDeclarationMap, fileName, outFileName } = param;
    try {
        const babelTime = new Date().getTime();
        yield compileBabel(fileName, outFileName);
        connection.console.log(`Babel compilation took: ${new Date().getTime() - babelTime}ms`);
    }
    catch (e) {
        connection.console.log(`Unable to transpile file: ${e.message}`);
        return;
    }
    if (compileTS) {
        try {
            const tsTime = new Date().getTime();
            yield compileTypescript(fileName, emitTSDeclarationMap);
            connection.console.log(`TS compilation took: ${new Date().getTime() - tsTime}ms`);
        }
        catch (e) {
            connection.console.log(`Unable to produce TS declaration: ${e.message}`);
        }
    }
}));
connection.listen();
//# sourceMappingURL=compile_process.js.map