export type TokenType =
  | "KEYWORD"
  | "IDENTIFIER"
  | "STRING"
  | "SYMBOL"
  | "NUMBER"
  | "WHITESPACE"
  | "COMMENT"
  | "ERROR";

export interface Token {
  type: TokenType;
  value: string;
}