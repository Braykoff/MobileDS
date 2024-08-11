import { NTItem, NTTable } from "@/util/nt/NTData"
import { View, Text } from "react-native";

type NTTableItemProps = {
  contents: NTItem
}

export function NTTableItem({ contents }: NTTableItemProps) {
  console.log("NTTABLE RENDER!");
  if (contents instanceof NTTable) {
    // This is a NTTable
    return (
      <View>
        <Text>NTTable: {contents.name}</Text>
      </View>
    );
  } else {
    // This is a NTTopic
    return (
      <View>
        <Text>NTTopic: {contents.name}</Text>
      </View>
    );
  }
}