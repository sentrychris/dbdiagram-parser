import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import testBasic from "./schemas/test";
import testAdvanced from "./schemas/test-advanced";

const lexer = new Lexer(testAdvanced);
const tokens = lexer.lex();
const parser = new Parser(tokens);
const ast = parser.parse();

console.log(JSON.stringify(ast, null, 2));