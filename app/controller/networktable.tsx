import { FlatList, StyleSheet } from "react-native";
import { getCurrentNTConnection } from "@/util/nt/NTComms";
import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";
import { NTItem, NTTable } from "@/util/nt/NTData";
import { useEffect, useState } from "react";
import { scale } from "react-native-size-matters";
import { NTTableEmptyItem } from "@/components/NTTable/NTTableEmptyItem";
import { useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNTConnected, useNTTableUpdated } from "@/util/nt/NTHooks";
import { NTTableSubtableItem } from "@/components/NTTable/NTTableSubtableItem";
import { NTTableTopicItem } from "@/components/NTTable/NTTableTopicItem";
import { getCurrentDSConnection } from "@/util/ds/DSComms";
import { useDSConnected } from "@/util/ds/DSHooks";

/** Ran recursively to populate a list with NTItems to render. */
function buildRenderedListRecursive(table: NTTable, rendered: NTItem[]) {
  // Render our subtables
  for (let sub in table.subtables) {
    var subtable = table.subtables[sub];
    rendered.push(subtable);
    if (subtable.expanded) { buildRenderedListRecursive(subtable, rendered); }
  }

  // Render our topics
  for (let topic in table.topics) {
    rendered.push(table.topics[topic]);
  }
}

/** Runs recursive function to populate a list with NTItems. */
function buildRenderedList(table: NTTable): NTItem[] {
  var rendered: NTItem[] = [];
  buildRenderedListRecursive(table, rendered);
  return rendered;
}

/**
* The screen for all viewing the NetworkTables data.
*/
export default function NetworkTableScreen() {
  const navigation = useNavigation();
  
  // Get connection
  const ntConnection = getCurrentNTConnection();
  const dsConnection = getCurrentDSConnection();
  
  if (ntConnection == null || dsConnection == null) {
    // This should never run
    throw `Connection is null (nt: ${ntConnection}, ds: ${dsConnection})`;
  }
  
  // Listen for status change
  const isNTConnected = useNTConnected(ntConnection);
  const isDSConnected = useDSConnected(dsConnection);

  useEffect(() => {
    navigation.setOptions(createDrawerOptions(ntConnection, dsConnection));
  }, [navigation, ntConnection, dsConnection, isNTConnected, isDSConnected]);
  
  // Create rendered NT table
  const [renderedNTTable, setRenderedNTTable] = useState(buildRenderedList(ntConnection.rootNetworkTable));
  
  // Listen for table change
  const tableUpdateListener = useNTTableUpdated(ntConnection);

  useEffect(() => {
    setRenderedNTTable(buildRenderedList(ntConnection.rootNetworkTable));
  }, [ntConnection.rootNetworkTable, tableUpdateListener]);
  
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={styles.table}
        data={renderedNTTable}
        renderItem={({item}) => {
          if (item instanceof NTTable) {
            // This item is a subtable
            return (<NTTableSubtableItem table={item} connection={ntConnection} />);
          } else {
            // This item is a topic
            return (<NTTableTopicItem topic={item} connection={ntConnection} />)
          }
        }}
        ListEmptyComponent={ <NTTableEmptyItem /> }
        keyExtractor={(item: NTItem) => item.fullName}
      />
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  table: {
    flex: 1,
    margin: scale(3)
  }
});
