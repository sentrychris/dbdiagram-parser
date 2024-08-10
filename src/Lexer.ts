import { Token } from "./interfaces/Token";

/**
 * The Lexer class is responsible for converting a raw string input (DBAL syntax)
 * into a list of tokens that represent the individual components of the syntax.
 * These tokens are then used by the Parser to construct an Abstract Syntax Tree (AST).
 * 
 * The Lexer processes the input character by character, identifying keywords, identifiers,
 * symbols, strings, and whitespace, and categorizes them into corresponding token types.
 * 
 * Usage:
 * - Instantiate the Lexer with a DBAL input string.
 * - Call the `lex()` method to generate the list of tokens.
 */
export class Lexer {
  /** Input to be tokenized */
  private input: string;

  /** Lexical position */
  private position: number;

  /** Tokenized output **/
  private tokens: Token[];

  /**
   * Initializes a new instance of the Lexer class.
   * 
   * @param input - The DBAL input string to be tokenized.
   */
  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.tokens = [];
  }

  /**
   * Checks if the given character is a letter.
   * 
   * @param char - The character to check.
   * @returns True if the character is a letter, otherwise false.
   */
  private isLetter(char: string): boolean {
    return /^[a-zA-Z]$/.test(char);
  }

  /**
   * Checks if the given character is a digit.
   * 
   * @param char - The character to check.
   * @returns True if the character is a digit, otherwise false.
   */
  private isDigit(char: string): boolean {
    return /^[0-9]$/.test(char);
  }

  /**
   * Checks if the given character is a whitespace character.
   * 
   * @param char - The character to check.
   * @returns True if the character is whitespace, otherwise false.
   */
  private isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }

  /**
   * Checks if the given character can be part of an identifier.
   * Identifiers can include letters, digits, and periods.
   * 
   * @param char - The character to check.
   * @returns True if the character is valid in an identifier, otherwise false.
   */
  private isIdentifierChar(char: string): boolean {
    return this.isLetter(char) || this.isDigit(char) || char === ".";
  }

  /**
   * Advances the current position in the input string by one character.
   */
  private advance(): void {
    this.position++;
  }

  /**
   * Peeks at the current character in the input string without advancing the position.
   * 
   * @returns The current character.
   */
  private peek(): string {
    return this.input[this.position];
  }

  /**
   * Tokenizes the entire input string by categorizing each character or sequence of characters
   * into tokens such as keywords, identifiers, symbols, strings, and whitespace.
   * 
   * @returns The list of tokens generated from the input string.
   */
  private tokenize(): Token[] {
    while (this.position < this.input.length) {
      const char = this.peek();

      if (this.isWhitespace(char)) {
        this.tokenizeWhitespace();
      } else if (this.isLetter(char)) {
        this.tokenizeIdentifierOrKeyword();
      } else if (char === "'" || char === '"') {
        this.tokenizeString();
      } else if ("{}[]:,<>".includes(char)) {
        this.tokens.push({ type: "SYMBOL", value: char });
        this.advance();
      } else {
        throw new Error(`Unexpected character: ${char}`);
      }
    }

    return this.tokens;
  }

  /**
   * Tokenizes a sequence of whitespace characters.
   * Adds a WHITESPACE token to the tokens list.
   */
  private tokenizeWhitespace(): void {
    let value = "";
    while (this.isWhitespace(this.peek())) {
      value += this.peek();
      this.advance();
    }
    this.tokens.push({ type: "WHITESPACE", value });
  }

  /**
   * Tokenizes an identifier or a keyword.
   * Distinguishes between keywords and identifiers based on predefined keywords.
   */
  private tokenizeIdentifierOrKeyword(): void {
    let identifier = "";
    while (this.isIdentifierChar(this.peek())) {
      identifier += this.peek();
      this.advance();
    }

    const keywords = [
      "Table",
      "Note",
      "ref",
      "not",
      "null",
      "unique",
      "default",
      "bool",
      "string",
      "int",
      "float",
      "bool",
    ];

    if (keywords.includes(identifier)) {
      this.tokens.push({ type: "KEYWORD", value: identifier });
    } else {
      this.tokens.push({ type: "IDENTIFIER", value: identifier });
    }
  }

  /**
   * Tokenizes a string literal enclosed in single or double quotes.
   * Handles both single-quoted and double-quoted strings.
   */
  private tokenizeString(): void {
    const quoteType = this.peek(); // Could be either single or double quote
    let string = "";
    this.advance(); // Skip the opening quote

    while (this.peek() !== quoteType && this.position < this.input.length) {
      string += this.peek();
      this.advance();
    }

    this.advance(); // Skip the closing quote

    this.tokens.push({ type: "STRING", value: string });
  }

  /**
   * The main method that initiates the tokenization process.
   * 
   * @returns The list of tokens generated from the input string.
   */
  public lex(): Token[] {
    return this.tokenize();
  }
}
