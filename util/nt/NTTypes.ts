import { NTEditType, NTTable, NTTopic } from "./NTData"

export function createTypedNTTopic(
  fullName: string, 
  id: number, 
  typeString: string,
  rootNetworkTable: NTTable
): NTTopic {
  switch (typeString) {
    case "boolean":
      return new NTBooleanTopic(fullName, typeString, id, rootNetworkTable);
    case "double": 
    case "int":
    case "float":
      return new NTNumberTopic(fullName, typeString, id, rootNetworkTable);
    case "string":
    case "json":
      return new NTStringTopic(fullName, typeString, id, rootNetworkTable);
    default:
      // TODO: structs should be handled
      return new NTRawDataTopic(fullName, typeString, id, rootNetworkTable);
  }
}

/** NT Topic containing a boolean */
class NTBooleanTopic extends NTTopic {
  public editable = NTEditType.Boolean;
  
  private value = false;

  public getValue(): string {
    return this.value.toString();
  }

  public setValue(newValue: any): void {
    if (typeof newValue == "string") {
      this.value = Boolean(newValue);
    } else if (typeof newValue == "boolean") {
      this.value = newValue;
    } else {
      console.log(`Topic ${this.fullName} cannot handle new value ${newValue}`);
    }
  }

  public verifyType(type: number): boolean {
      return (type == 0);
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
    if (typeof newValue == "string") {
      this.value = parseFloat(newValue);
    } else if (typeof newValue == "number") {
      this.value = newValue;
    } else {
      console.log(`Topic ${this.fullName} cannot handle new value ${newValue}`);
    }
  }

  public verifyType(type: number): boolean {
      return (type == 1) || (type == 2) || (type == 3);
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

  public verifyType(type: number): boolean {
      return (type == 4);
  }
}


/** NT Topic containing raw data */
class NTRawDataTopic extends NTTopic {
  public editable = NTEditType.Uneditable;
  
  private value: Object | null = null;

  public getValue(): string {
    if (this.value === null) {
      return "null";
    }

    return this.value.toString();
  }

  public setValue(newValue: any): void {
    if (typeof newValue == "object") {
      this.value = newValue;
    } else {
      console.log(`Topic ${this.fullName} cannot handle new value ${newValue}`);
    }
  }

  public verifyType(type: number): boolean {
      return (type == 5) || (type >= 16 && type <= 20);
  }
}
