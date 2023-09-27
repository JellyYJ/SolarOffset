/**
 * used to pretty the code
 * https://prettier.io/docs/en/options.html
 */
module.exports = {
    // Specify the line length that the printer will wrap on
    printWidth: 120,

    // Specify the number of spaces per indentation-level
    tabWidth: 4,

    // Indent lines with tabs instead of spaces
    useTabs: false,

    // Print semicolons at the ends of statements
    semi: true,

    // Use single quotes instead of double quotes
    singleQuote: false,

    // Print trailing commas wherever possible in multi-line comma-separated syntactic structures.
    // (A single-line array, for example, never gets trailing commas.)
    // es5|none|all
    trailingComma: "es5",

    // Print spaces between brackets in object literals.
    // true: { foo: bar }
    // false: {foo: bar}
    bracketSpacing: true,

    // Put the > of a multi-line HTML (HTML, JSX, Vue, Angular) element at the end of the last line instead of being alone on the next line (does not apply to self closing elements).
    // false: <div
    //          className=""
    //          style={{}}
    //       >
    // true: <div
    //          className=""
    //          style={{}} >
    jsxBracketSameLine: false,

    // Include parentheses around a sole arrow function parameter.
    // avoid: x => x
    // always (x) => x
    arrowParens: "always",

    proseWrap: "preserve"
};
