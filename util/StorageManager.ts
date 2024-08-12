import AsyncStorage from "@react-native-async-storage/async-storage";

export const StorageKeys = {
  /** The last address connected to */
  lastAddress: "lastAddress"
}

/** Tries to read a value from storage, returning the default value if failure. */
export async function getStoredData(key: string, defaultValue: string): Promise<string> {
  try {
    const value = await AsyncStorage.getItem(key);

    if (value !== null) return value;
  } catch (e) {
    console.log(`Error reading '${key}' from AsyncStorage: ${e}`);
  }

  return defaultValue;
}

/** Tries to set a value to storage. */
export async function setStoredData(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.log(`Error writing '${key}' to AsyncStorage: ${e}`);
  }
}