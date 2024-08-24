import { Colors } from "@/constants/Colors";
import { NTConnection, NTConnectionEvents } from "@/util/nt/NTComms";
import { NTTable } from "@/util/nt/NTData"
import { View, Text, StyleSheet, Image } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { scale } from "react-native-size-matters";
import { ColoredPressable } from "./ColoredPressable";

type NTSubtableItemProps = {
  table: NTTable,
  connection: NTConnection
}

/** A single subtable in the NetworkTable table list. */
export function NTTableSubtableItem({ table, connection }: NTSubtableItemProps) {
  return (
    <ColoredPressable 
      defaultColor={Colors.app.accentColor}
      hoverColor={Colors.app.accentColorDark}
      style={[styles.item, { 
        marginLeft: RFPercentage(2) * Math.min(table.depth - 1, 6) // Indentation
      }]}
      onPress={ () => {
        table.expanded = !table.expanded;
        // Emit the TableUpdated event to trigger a rerender of the table:
        connection.events.emit(NTConnectionEvents.TableUpdated, `NTTableItem.onPress:${table.fullName}`);

        // If we're collapsed, hide all children and unregister their publishers
        if (!table.expanded) {
          hideAndUnpublishAllChildTopics(connection, table);
        }
      }}
    >
      { /* Dropdown arrow */}
      <Image 
        style={[styles.ntDropdownArrow, {
          transform: [{ rotate: `${ table.expanded ? 90 : 0 }deg` }]
        }]}
        source={require("../assets/images/dropdown-arrow.png")} />
      { /* NTTable name */}
      <View style={{flex: 1}}>
        <Text 
          style={styles.label} 
          numberOfLines={1}>
            {table.name}
        </Text>
      </View>
    </ColoredPressable>
  );
}

function hideAndUnpublishAllChildTopics(connection: NTConnection, table: NTTable) {
  // Hide and unpublish topics
  for (const topic in table.topics) {
    var t = table.topics[topic];

    t.expanded = false;

    if (t.hasPublishId) {
      connection.unRequestPublisher(t);
    }
  }

  // Do the same for our subtables
  for (const subtable in table.subtables) {
    hideAndUnpublishAllChildTopics(connection, table.subtables[subtable]);
  }
}

// Style
const styles = StyleSheet.create({
  item: {
    padding: scale(4),
    margin: scale(2),
    flexDirection: "row"
  },
  label: {
    fontFamily: "Montserrat-Regular",
    color: Colors.app.lightTextColor,
    fontSize: RFPercentage(2)
  },
  labelBold: {
    fontFamily: "Montserrat-Bold",
    color: Colors.app.lightTextColor,
    fontSize: RFPercentage(2)
  },
  ntDropdownArrow: {
    tintColor: Colors.app.lightTextColor,
    marginRight: scale(3),
    width: RFPercentage(2),
    height: "100%"
  }
});
