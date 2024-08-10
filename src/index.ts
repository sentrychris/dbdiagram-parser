import { exit } from "process";
import { Lexer } from "./Lexer";
import { Parser } from "./Parser";

// Assuming the Lexer class is the one from the previous implementation
const dbal = `
Table affiliate {
  affiliateId string [not null, unique]
  code string [not null, unique]
  name string [not null]
  base64Image string [not null]
  createdAt string [not null]
  updatedAt string

  Note: 'Stores affiliates available for user registration'
}

Table affiliateRegistrationValidation {
  validationId string [not null, unique]
  validationType string [not null, unique]
  validationStoragePath string [not null]
  affiliateCode string [not null, ref: <> affiliate.code]
  createdAt string [not null]
  updatedAt string

  Note: 'Stores affiliates available for user registration'
}

Table client {
  clientId string [not null]
  userPoolId string [not null]
  domain string [not null]
  identityProvider string [not null]
  name string [not null]
  scope string [not null]

  Note: 'Stores details of app clients used by the Cognito user pool'
}

Table user {
  userId string [not null, unique]
  username string [not null, unique]
  memberId string [not null, note: "DMS member ID - used for mapping data monitoring assets to requesting cognito users, could be stored here for convenience and avoiding overhead in identifying DMS member from cognito users."]

  Note: 'Simple user entity to map DMS member IDs without use of Cognito custom attributes'
}

Table membership {
  userId string [not null, ref: <> user.userId]
  userEmail string [not null]
  affiliateCode string [not null, ref: <> affiliate.code]
  isActive bool [not null, default: true]
  isPrimary bool [not null, default: true]
  createdAt string [not null]
  updatedAt string

  Note: 'Stores link between users and affiliates'
}
`;
const lexer = new Lexer(dbal);
const tokens = lexer.lex();
const ast = (new Parser(tokens)).parse();
console.log(JSON.stringify(ast, null, 2));