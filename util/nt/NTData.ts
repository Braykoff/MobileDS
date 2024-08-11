/** Describes how an NTTopic can be edited */
export enum NTEditType {
  AlphaNumeric, Numeric, Boolean, Uneditable
}

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

  /** How this topic can be edited */
  public abstract editable: NTEditType;
  
  public constructor(fullName: string, type: string, id: number, root: NTTable) {
    if (fullName.charAt(0) === "/") { fullName = fullName.substring(1); } // Remove leading '/'
    var splitName = fullName.split("/")

    this.name = splitName.at(-1) ?? "FAILED_TO_PARSE_NAME";
    this.fullName = fullName;
    this.type = type;
    this.id = id;

    // Find parent
    splitName.pop();
    var parent = root;

    for (let ancestor of splitName) {
      // Create a new NTTable, if needed
      if (!(ancestor in parent.subtables)) { new NTTable(parent, ancestor); }
      parent = parent.subtables[ancestor];
    }

    this.parent = parent;
    parent.topics[this.name] = this;
  }

  /** Gets the value as a string. */
  public abstract getValue(): string;

  /** Sets a new value (Must also accept strings if editable). */
  public abstract setValue(newValue: any): void;

  /** Returns whether the type int (from a MessagePack) matches the type of the Topic. */
  public abstract verifyType(type: number): boolean;
}

/** A NetworkTable containing subtables and topics. */
export class NTTable {
  /** Name of this table */
  public name: string;
  
  /** List of subtables */
  public subtables: { [name: string]: NTTable } = {};
  
  /** List of topics */
  public topics: { [name: string]: NTTopic } = {};
  
  /** Parent of this table */
  public parent: NTTable | null;
  
  /** Whether the table is currently being shown */
  public shown: boolean = false;
  
  /** The depth of the topic (ie, number of parents) */
  public depth: number;
  
  public constructor(parent: NTTable | null, name: string) {
    this.parent = parent
    this.name = name;
    
    // Add to parent
    if (this.parent != null) {
      this.parent.subtables[name] = this;
      this.depth = this.parent.depth + 1;
    } else {
      // This is the root table
      this.depth = 0;
      this.shown = true;
    }
  }
}