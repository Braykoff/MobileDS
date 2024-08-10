/**
 * An interface defining a NT topic.
 */
export abstract class NTTopic {
    /** The pretty name of this topic */
    name: string;
    /** The full name of this topic */
    fullName: string;
    /** The id number of this topic */
    id: number;
    /** The parent table of this topic */
    parent: NTTable;
    /** The timestamp of the last update */
    lastUpdate: number = -1;

    /** The type, as a string */
    abstract type: string;
    /** Whether this type allows editing */
    abstract editable: boolean;
    /** Whether editing this type should force a numerical keyboard */
    abstract forceNumerical: boolean;

    constructor(fullName: string, id: number, parent: NTTable) {
        this.name = fullName.split("/").at(-1) ?? "FAILED_TO_PARSE_NAME";
        this.fullName = fullName;
        this.id = id;
        this.parent = parent;

        this.parent.topics.push(this); // Add to topic
    }
}

/**
 * A NetworkTable containing subtables and topics.
 */
export class NTTable {
    /** Name of this table */
    public name: string;

    /** List of subtables */
    public subtables: NTTable[] = [];

    /** List of topics */
    public topics: NTTopic[] = [];

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
            this.parent.subtables.push(this);
            this.depth = this.parent.depth + 1;
        } else {
            // This is the root table
            this.depth = 0;
            this.shown = true;
        }
    }
}