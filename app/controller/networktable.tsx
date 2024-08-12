import { FlatList, Pressable, SafeAreaView, StyleSheet, Text } from "react-native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { ControllerDrawerParamList } from "./_layout";
import { getCurrentNTConnection, NTConnectionEvents } from "@/util/nt/NTComms";
import { ExceptionText } from "@/components/ExceptionText";
import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";
import { NTTableItem } from "@/components/NTTableItem";
import { NTItem, NTTable, NTTopic } from "@/util/nt/NTData";
import { useState } from "react";
import { scale } from "react-native-size-matters";
import { Colors } from "@/constants/Colors";

// Init navigation
type NetworkTableScreenNavigationProp = DrawerNavigationProp<ControllerDrawerParamList, "NetworkTables">;
type Props = { navigation: NetworkTableScreenNavigationProp }

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
export default function NetworkTableScreen({ navigation } : Props) {
  // Get NTConnection
  const ntConnection = getCurrentNTConnection();
  
  if (ntConnection == null) {
    // This should never run
    return ExceptionText("There is no current NT connection");
  }
  
  // Listen for status change
  ntConnection.events.addListener(NTConnectionEvents.ConnectionStatusChanged, () => {
    navigation.setOptions(createDrawerOptions(ntConnection));
  });
  
  // Create rendered NT table
  const [renderedNTTable, setRenderedNTTable] = useState(buildRenderedList(ntConnection.rootNetworkTable));
  
  // Listen for table change
  ntConnection.events.addListener(NTConnectionEvents.TableUpdated, (sender) => {
    setRenderedNTTable(buildRenderedList(ntConnection.rootNetworkTable));
    console.log(`Request rerender by ${sender}`);
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={styles.table}
        data={renderedNTTable}
        renderItem={({item}) => <NTTableItem contents={item} />}
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