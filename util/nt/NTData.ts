/** Describes how an NTTopic can be edited */
export enum NTEditType {
  AlphaNumeric, Numeric, Boolean, Uneditable
}

/** Removes the leading slash in a name, if it exists. */
function removeLeadingSlash(input: string): string {
  if (input.charAt(0) === "/") return input.substring(1);
  else return input;
}

/** Either an NTTopic or an NTTable. */
export type NTItem = (NTTable | NTTopic);

/** A NetworkTables topic of abstract type. */
export abstract class NTTopic {
  /** The pretty name of this topic */
  public name: string;
  /** The full name of this topic */
  public fullName: string;
  /** The id number used to subscribe to (and optionally publish to) this topic */
  public id: number;
  /** The parent table of this topic */
  public parent: NTTable;
  /** The timestamp of the last update */
  public lastUpdate: number = -1;
  /** The type, as a string */
  public type: string;
  /** The type, as a number */
  public typeInt: number;
  /** Whether this topic is expanded in the UI */
  public expanded = false;
  /** Whether this topic can be published to yet */
  public hasPublishId = false;

  /** How this topic can be edited */
  public abstract editable: NTEditType;
  
  public constructor(fullName: string, type: string, typeInt: number, id: number, root: NTTable) {
    fullName = removeLeadingSlash(fullName);
    var splitName = fullName.split("/")

    this.name = splitName.at(-1) ?? "";
    this.fullName = fullName;
    this.type = type;
    this.typeInt = typeInt;
    this.id = id;

    // Find parent
    splitName.pop();
    var parent = root;
    var fullTableName = ""; // In case new NTTable needs to be created

    for (let ancestor of splitName) {
      // Create a new NTTable, if needed
      fullTableName += `/${ancestor}`;
      if (!(ancestor in parent.subtables)) { new NTTable(parent, fullTableName); }
      parent = parent.subtables[ancestor];
    }

    this.parent = parent;

    if (this.name in parent.topics) {
      console.log("Creating new NTTopic for an already-created topic");
    }

    parent.topics[this.name] = this;
  }

  /** Gets the value as a string. */
  public abstract getValue(): string;

  /** Sets a new value that is already its type. */
  public abstract setValue(newValue: any): void;

  /** Convert a string into the proper type for this topic (only if editable). */
  public abstract convertValue(value: string): any;
}

/** A NetworkTable containing subtables and topics. */
export class NTTable {
  /** Pretty name of this table */
  public name: string;

  /** The full name of this table */
  public fullName: string;
  
  /** List of subtables */
  public subtables: { [name: string]: NTTable } = {};
  
  /** List of topics */
  public topics: { [name: string]: NTTopic } = {};
  
  /** Parent of this table */
  public parent: NTTable | null;
  
  /** Whether the table is currently expanded/collapsed (when rendered in networktable) */
  public expanded = false;
  
  /** The depth of the topic (ie, number of parents) */
  public depth: number;
  
  public constructor(parent: NTTable | null, fullName: string) {
    this.parent = parent

    fullName = removeLeadingSlash(fullName);
    this.fullName = fullName;
    this.name = fullName.split("/").at(-1) ?? "";
    
    // Add to parent
    if (this.parent != null) {
      this.parent.subtables[this.name] = this;
      this.depth = this.parent.depth + 1;
    } else {
      // This is the root table
      this.depth = 0;
      this.expanded = true;
    }
  }

  /** Prints this out in the console.log, with all its descendants. */
  public print() {
    var depth = " ".repeat(this.depth);
    var depthPlusOne = " ".repeat(this.depth + 1);

    console.log(`${depth}Table '${this.name}': {`);

    // Print topics
    for (var topic in this.topics) {
      console.log(`${depthPlusOne}Topic '${topic}': '${this.topics[topic].getValue()}' (type '${this.topics[topic].type}')`);
    }

    // Print tables
    for (var table in this.subtables) {
      this.subtables[table].print();
    }

    console.log(`${depth}}`);
  }
}