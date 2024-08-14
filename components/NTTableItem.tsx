import { Colors } from "@/constants/Colors";
import { NTConnection, NTConnectionEvents } from "@/util/nt/NTComms";
import { NTEditType, NTItem, NTTable, NTTopic } from "@/util/nt/NTData"
import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, Alert } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { scale } from "react-native-size-matters";

type NTTableItemProps = {
  contents: NTItem,
  connection: NTConnection
}

/** A single item in the NetworkTable table. */
export function NTTableItem({ contents, connection }: NTTableItemProps) {
  const [isHovering, setHovering] = useState(false);

  if (contents instanceof NTTable) {
    // This is an NTTable
    return (
      <Pressable 
        style={[styles.item, { 
          backgroundColor: !isHovering ? Colors.app.accentColor : Colors.app.accentColorDark, 
          marginLeft: RFPercentage(2) * Math.min(contents.depth - 1, 6) // Indentation
        }]}
        onPressIn={ () => setHovering(true) }
        onPressOut={ () => setHovering(false) }
        onPress={ () => {
          contents.expanded = !contents.expanded;
          // Hijack the TableUpdated event to trigger a rerender of the table:
          connection.events.emit(NTConnectionEvents.TableUpdated, `NTTableItem.onPress:${contents.fullName}`);
        }}
      >
        { /* Dropdown arrow */}
        <Image 
          style={[styles.ntDropdownArrow, {
            transform: [{ rotate: `${ contents.expanded ? 90 : 0 }deg` }]
          }]}
          source={require("../assets/images/dropdown-arrow.png")} />
        { /* NTTable name */}
        <View style={{flex: 1}}>
          <Text 
            style={styles.label} 
            numberOfLines={1}>
              {contents.name}
          </Text>
        </View>
      </Pressable>
    );
  } else {
    // This is an NTTopic
    const [, setLastUpdate] = useState(contents.lastUpdate);
    const [expanded, setExpanded] = useState(contents.expanded);
    const [updatePressed, setUpdatePressed] = useState(false); // Only used if expanded

    // Listen for a future change
    connection.events.addSingleListener(NTConnectionEvents.TopicUpdated + contents.fullName, () => {
      setLastUpdate(contents.lastUpdate);
    });

    // Not expanded
    return (
      <Pressable 
        style={[styles.item, {
          backgroundColor: !isHovering ? Colors.networkTable.ntTopicItemBackground : Colors.networkTable.ntTopicItemBackgroundHover,
          marginLeft: RFPercentage(2) * Math.min(contents.parent.depth, 6) // Indentation
        }]}
        onPressIn={ () => setHovering(true) }
        onPressOut={ () => setHovering(false) }
        onPress={ () => {
          contents.expanded = !contents.expanded;

          // Handle publishers
          if (contents.editable !== NTEditType.Uneditable) {
            if (contents.expanded) { connection.requestPublisher(contents); }
            else { connection.unRequestPublisher(contents); }
          }

          setExpanded(contents.expanded);
        }}
      >
        { expanded ? NTTopicExpanded(contents, connection, updatePressed, setUpdatePressed) : NTTopicCollapsed(contents) }
      </Pressable>
    );
  }
}

/** Returns the contents of an NTTopic item, when collapsed (not expanded). */
function NTTopicCollapsed(contents: NTTopic) {
  return (
    <View style={{flexDirection: "row", flex: 1}}>
      { /* Topic name */}
      <View style={{flex: 2.5}}>
        <Text style={[styles.label, styles.ntTopicLabel]} numberOfLines={1}>{contents.name}</Text>
      </View>
      { /* Topic value */}
      <View style={{flex: 5}}>
        <Text style={[styles.label, styles.ntTopicLabel]} numberOfLines={1}>{contents.getValue()}</Text>
      </View>
      { /* Topic type */}
      <View style={{flex: 2}}>
        <Text style={[styles.label, styles.ntTopicLabel]} numberOfLines={1}>{contents.type}</Text>
      </View>
    </View>
  );
}

/** Prompts the user to edit an NTTopic */
function editNTTopic(topic: NTTopic, connection: NTConnection) {
  switch (topic.editable) {
    case NTEditType.AlphaNumeric: 
    case NTEditType.Numeric: {
      // Alphanumeric or numeric input
      Alert.prompt(
        `Edit '${topic.name}'`, 
        topic.fullName,
        [{
          text: "Update",
          style: "default",
          onPress: (value: string | undefined) => {
            if (value === undefined) { return; }
            connection.publishValue(topic, topic.convertValue(value));
          }}, {
          text: "Cancel",
          style: "cancel"
        }],
        "plain-text",
        topic.getValue(),
        (topic.editable === NTEditType.AlphaNumeric) ? "default" : "decimal-pad"
      );
      break;
    }
    case NTEditType.Boolean: {
      // Boolean input
      Alert.alert(
        `Edit '${topic.name}'`,
        topic.fullName,
        [{
          text: "Set 'true'",
          onPress: () => {
            connection.publishValue(topic, true);
          }
        }, {
          text: "Set 'false'",
          onPress: () => {
            connection.publishValue(topic, false);
          }
        }, {
          text: "Cancel",
          isPreferred: true
        }]
      );
      break;
    }
  }
}

/** Returns the contents of an NTTopic item, when expanded. */
function NTTopicExpanded(
  contents: NTTopic, 
  connection: NTConnection,
  updatePressed: boolean, 
  setUpdatePressed: React.Dispatch<React.SetStateAction<boolean>>
) {

  return (
    <View style={{flex: 1}}>
      { /* Topic name */}
      <View style={{flexDirection: "row"}}>
        <Text 
          style={[styles.labelBold, styles.ntTopicLabel]} 
          numberOfLines={1}>({contents.type})&nbsp;
        </Text>
        <Text style={[styles.label, styles.ntTopicLabel]} numberOfLines={1}>{contents.fullName}</Text>
      </View>
      { /* Last updated */}
      <View style={{flexDirection: "row"}}>
        <Text 
          style={[styles.labelBold, styles.ntTopicLabel]} 
          numberOfLines={1}>Last Update:&nbsp;
        </Text>
        <Text style={[styles.label, styles.ntTopicLabel]} numberOfLines={1}>{contents.lastUpdate / 1e+6}s</Text>
      </View>
      { /* Value */}
      <View style={{flexDirection: "row"}}>
        <Text 
          style={[styles.labelBold, styles.ntTopicLabel]} 
          numberOfLines={1}>Value:&nbsp;
        </Text>
        <Text style={[styles.label, styles.ntTopicLabel]} numberOfLines={1}>{contents.getValue()}</Text>
      </View>
      { /* Update */}
      { contents.editable !== NTEditType.Uneditable && (
        <View style={{flexDirection: "row"}}>
          <Pressable 
            style={[styles.ntTopicUpdateBttn, { 
              backgroundColor: !updatePressed ? Colors.app.accentColor : Colors.app.accentColorDark
            }]}
            onPressIn={ () => setUpdatePressed(true) }
            onPressOut={ () => setUpdatePressed(false) }
            onPress={ () => editNTTopic(contents, connection) }
          >
            <Text style={[styles.label, styles.ntTopicLabel]}>Edit</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// Style
const styles = StyleSheet.create({
  /** Generic NTItem styling */
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
  /** NTTable styling */
  ntDropdownArrow: {
    tintColor: Colors.app.lightTextColor,
    marginRight: scale(3),
    width: RFPercentage(2),
    height: "100%"
  },
  /** NTTopic styling */
  ntTopicLabel: {
    fontSize: RFPercentage(1.8)
  },
  ntTopicUpdateBttn: {
    paddingVertical: scale(1.5),
    paddingHorizontal: scale(8),
    margin: scale(1.5)
  }
});