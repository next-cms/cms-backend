const _BabelParser = require("@babel/parser");

export default {
    parse: function (code) {
        return _BabelParser.parse(code, {
            // parse in strict mode and allow module declarations
            sourceType: "module",

            plugins: [
                // enable jsx and flow syntax
                "jsx",
                "flow"
            ]
        });
    }
};
