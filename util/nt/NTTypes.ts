import { NTEditType, NTTable, NTTopic } from "./NTData"

/** NT Topic containing a boolean */
class NTBooleanTopic extends NTTopic {
  public editable = NTEditType.Boolean;
  
  private value = false;

  public getValue(): string {
    return this.value.toString();
  }

  public setValue(newValue: any): void {
    if (typeof newValue == "boolean") {
      this.value = newValue;
    } else {
      console.log(`Topic ${this.fullName} cannot handle new value ${newValue}`);
    }
  }

  public convertValue(value: string): any {
      return Boolean(value);
  }
}

/** NT Topic containing a Number */
class NTNumberTopic extends NTTopic {
  public editable = NTEditType.Numeric;
  
  private value = 0.0;

  public getValue(): string {
    return this.value.toString();
  }

  public setValue(newValue: any): void {
    if (typeof newValue == "number") {
      this.value = newValue;
    } else {
      console.log(`Topic ${this.fullName} cannot handle new value ${newValue}`);
    }
  }

  public convertValue(value: string): any {
    if (this.typeInt === 2) {
      // This is an integer topic
      return parseInt(value);
    } else {
      // This is a float/double topic
      return parseFloat(value);
    }
  }
}

/** NT Topic containing a String */
class NTStringTopic extends NTTopic {
  public editable = NTEditType.AlphaNumeric;
  
  private value = "";

  public getValue(): string {
    return this.value;
  }

  public setValue(newValue: any): void {
    if (typeof newValue == "string") {
      this.value = newValue;
    } else {
      console.log(`Topic ${this.fullName} cannot handle new value ${newValue}`);
    }
  }
  
  public convertValue(value: string): any {
    return value;
  }
}


/** NT Topic containing raw data */
class NTRawDataTopic extends NTTopic {
  public editable = NTEditType.Uneditable;
  
  private value: object | null = null;

  public getValue(): string {
    if (this.value === null) {
      return "null";
    }

    return this.value.toString();
  }

  public setValue(newValue: any): void {
    this.value = newValue;
  }

  public convertValue(value: string): any {
    // Raw types can't be edited
    return "not supported";
  }
}

export function createTypedNTTopic(
  fullName: string, 
  id: number, 
  typeString: string,
  rootNetworkTable: NTTable
): NTTopic {
  switch (typeString) {
    case "boolean":
      return new NTBooleanTopic(fullName, typeString, 0, id, rootNetworkTable);
    case "double": 
      return new NTNumberTopic(fullName, typeString, 1,  id, rootNetworkTable);
    case "int":
      return new NTNumberTopic(fullName, typeString, 2,  id, rootNetworkTable);
    case "float":
      return new NTNumberTopic(fullName, typeString, 3,  id, rootNetworkTable);
    case "string":
    case "json":
      return new NTStringTopic(fullName, typeString, 4, id, rootNetworkTable);
    case "boolean[]":
      return new NTRawDataTopic(fullName, typeString, 16, id, rootNetworkTable);
    case "double[]":
      return new NTRawDataTopic(fullName, typeString, 17, id, rootNetworkTable);
    case "int[]":
      return new NTRawDataTopic(fullName, typeString, 18, id, rootNetworkTable);
    case "float[]":
      return new NTRawDataTopic(fullName, typeString, 19, id, rootNetworkTable);
    case "string[]":
      return new NTRawDataTopic(fullName, typeString, 20, id, rootNetworkTable);
    default:
      // TODO: structs should be handled
      return new NTRawDataTopic(fullName, typeString, 5, id, rootNetworkTable);
  }
}
