export interface ASTNode {
  type: string;
}

export interface TableNode extends ASTNode {
  type: "Table";
  name: string;
  columns: ColumnNode[];
  note?: string;
}

export interface ColumnNode extends ASTNode {
  type: "Column";
  name: string;
  dataType: string;
  constraints: string[];
  note?: string;
}

export interface ReferenceNode extends ASTNode {
  type: "Reference";
  source: string;
  target: string;
}

export interface AST {
  tables: TableNode[];
}
