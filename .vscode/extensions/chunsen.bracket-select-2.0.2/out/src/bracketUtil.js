'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.bracketUtil = void 0;
var bracketUtil;
(function (bracketUtil) {
    let bracketParis = [
        ["(", ")"],
        ["{", "}"],
        ["[", "]"]
    ];
    let quoteBrackets = ['"', "'", "`"];
    function isMatch(open, close) {
        if (isQuoteBracket(open)) {
            return open === close;
        }
        return bracketParis.findIndex(p => p[0] === open && p[1] === close) >= 0;
    }
    bracketUtil.isMatch = isMatch;
    function isOpenBracket(char) {
        return bracketParis.findIndex(pair => pair[0] === char) >= 0;
    }
    bracketUtil.isOpenBracket = isOpenBracket;
    function isCloseBracket(char) {
        return bracketParis.findIndex(pair => pair[1] === char) >= 0;
    }
    bracketUtil.isCloseBracket = isCloseBracket;
    function isQuoteBracket(char) {
        return quoteBrackets.indexOf(char) >= 0;
    }
    bracketUtil.isQuoteBracket = isQuoteBracket;
})(bracketUtil = exports.bracketUtil || (exports.bracketUtil = {}));
//# sourceMappingURL=bracketUtil.js.map