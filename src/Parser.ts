import type { AST, ColumnNode, TableNode } from "./interfaces/AST";
import type { Token, TokenType } from "./interfaces/Token";

/**
 * The Parser class is responsible for converting a stream of tokens, generated from a DBAL
 * input, into an Abstract Syntax Tree (AST). The AST represents the structure of the database
 * schema as defined by the DBAL. This includes tables, columns, constraints, and notes.
 * 
 * The parser processes tokens sequentially, recognizing key elements of the DBAL such as table
 * definitions, column properties, and  associated metadata. It handles errors gracefully by
 * providing meaningful error messages when unexpected tokens are encountered.
 * 
 * Usage:
 * - Instantiate the Parser with a list of tokens.
 * - Call the `parse()` method to generate the AST.
 */
export class Parser {
  /** Lexical tokens */
  private tokens: Token[];

  /** Token position */
  private position: number;

  /** Abstract syntax tree */
  private ast: AST;

  /**
   * Initializes a new instance of the Parser class.
   * 
   * @param tokens - The list of tokens to parse.
   */
  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.position = 0;
    this.ast = { tables: [] };
  }

  /**
   * Peeks at the current token without advancing the position.
   * 
   * @returns The current token or undefined if at the end of the list.
   */
  private peek(): Token | undefined {
    return this.tokens[this.position];
  }

  /**
   * Advances the current position and returns the next token.
   * 
   * @returns The next token or undefined if at the end of the list.
   */
  private advance(): Token | undefined {
    return this.tokens[this.position++];
  }

  /**
   * Skips over any whitespace tokens in the current position.
   */
  private skipWhitespace(): void {
    while (this.position < this.tokens.length && this.peek()?.type === "WHITESPACE") {
      this.advance();
    }
  }

  /**
   * Expects a specific token type and value at the current position.
   * Advances the position and returns the token if it matches the expectation.
   * 
   * @param type - The expected type of the token.
   * @param value - The expected value of the token (optional).
   * @returns The token if it matches the expected type and value.
   * @throws An error if the token doesn't match the expected type or value.
   */
  private expect(type: TokenType, value?: string): Token {
    this.skipWhitespace();
    const token = this.advance();
    if (!token || token.type !== type || (value && token.value !== value)) {
      throw new Error(`Expected ${type} '${value}', but got ${token?.type} '${token?.value}'`);
    }
    return token;
  }

  /**
   * Parses a table definition, including its columns and optional note.
   * 
   * @returns A TableNode representing the parsed table.
   */
  private parseTable(): TableNode {
    this.skipWhitespace();
    this.expect("KEYWORD", "Table");
    const nameToken = this.expect("IDENTIFIER");
    this.skipWhitespace();

    // Handle constraints immediately after the table name if any
    const constraints: string[] = [];
    if (this.peek()?.value === "[") {
      this.parseConstraints(constraints);
    }

    this.expect("SYMBOL", "{");

    const columns: ColumnNode[] = [];
    let note: string | undefined;

    while (this.peek() && this.peek()?.value !== "}") {
      this.skipWhitespace();
      if (this.peek()?.type === "IDENTIFIER") {
        columns.push(this.parseColumn());
      } else if (this.peek()?.type === "KEYWORD" && this.peek()?.value === "Note") {
        note = this.parseNote();
      } else if (this.peek()?.type === "SYMBOL" && this.peek()?.value === "[") {
        // Handle unexpected constraints inside the table body
        this.parseConstraints(constraints);
      } else if (this.peek()?.value === "}") {
        // Break out if we reach the end of the table definition
        break;
      } else {
        throw new Error(`Unexpected token ${this.peek()?.type} '${this.peek()?.value}'`);
      }
    }

    this.expect("SYMBOL", "}");

    return {
      type: "Table",
      name: nameToken.value,
      columns,
      note,
    };
  }

  /**
   * Parses a column definition, including its name, data type, constraints, and optional note.
   * 
   * @returns A ColumnNode representing the parsed column.
   */
  private parseColumn(): ColumnNode {
    this.skipWhitespace();
    const nameToken = this.expect("IDENTIFIER");
    const dataTypeToken = this.expect("KEYWORD");
    const constraints: string[] = [];

    // Check for constraints in square brackets after data type
    if (this.peek()?.value === "[") {
      this.parseConstraints(constraints);
    }

    // Check for inline note
    let note: string | undefined;
    if (this.peek()?.type === "KEYWORD" && this.peek()?.value === "note") {
      this.advance();
      this.expect("SYMBOL", ":");
      note = this.expect("STRING").value;
    }

    return {
      type: "Column",
      name: nameToken.value,
      dataType: dataTypeToken.value,
      constraints,
      note,
    };
  }

  /**
   * Parses a list of constraints enclosed in square brackets.
   * 
   * @param constraints - The array to store the parsed constraints.
   */
  private parseConstraints(constraints: string[]): void {
    this.expect("SYMBOL", "[");
    while (this.peek() && this.peek()?.value !== "]") {
      constraints.push(this.advance()!.value);
      if (this.peek()?.value === ",") {
        this.advance(); // Skip comma
      }
    }
    this.expect("SYMBOL", "]");
  }

  /**
   * Parses a note associated with a table or column.
   * 
   * @returns The parsed note as a string.
   */
  private parseNote(): string {
    this.skipWhitespace();
    this.expect("KEYWORD", "Note");
    this.expect("SYMBOL", ":");
    const noteToken = this.expect("STRING");
    return noteToken.value;
  }

  /**
   * The main parsing function that iterates over all tokens and constructs the AST.
   * 
   * @returns The constructed AST representing the entire DBAL structure.
   */
  public parse(): AST {
    while (this.position < this.tokens.length) {
      this.skipWhitespace();
      if (this.peek()?.type === "KEYWORD" && this.peek()?.value === "Table") {
        this.ast.tables.push(this.parseTable());
      } else if (!this.peek()) {
        // If we've reached the end of the tokens, break out of the loop
        break;
      } else {
        throw new Error(`Unexpected token ${this.peek()?.type} '${this.peek()?.value}'`);
      }
    }

    return this.ast;
  }
}
