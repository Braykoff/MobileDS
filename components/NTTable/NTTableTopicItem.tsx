import { Colors } from "@/constants/Colors";
import { NTConnection } from "@/util/nt/NTComms";
import { NTEditType, NTTopic } from "@/util/nt/NTData"
import { useNTTopicUpdated } from "@/util/nt/NTHooks";
import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { scale } from "react-native-size-matters";
import { ColoredPressable } from "../ColoredPressable";

type NTTableTopicItemProps = {
  topic: NTTopic,
  connection: NTConnection
}

/** A single topic in the NetworkTable table list. */
export function NTTableTopicItem({ topic, connection }: NTTableTopicItemProps) {
  useNTTopicUpdated(connection, topic); // This will trigger a rerender on change
  const [expanded, setExpanded] = useState(topic.expanded); // If the topic is expanded

  return (
    <ColoredPressable 
      defaultColor={Colors.networkTable.ntTopicItemBackground}
      hoverColor={Colors.networkTable.ntTopicItemBackgroundHover}
      style={[styles.item, {
        marginLeft: RFPercentage(2) * Math.min(topic.parent.depth, 6) // Indentation
      }]}
      onPress={ () => {
        topic.expanded = !topic.expanded;

        // Handle publishers
        if (topic.editable !== NTEditType.Uneditable) {
          if (topic.expanded) { connection.requestPublisher(topic); }
          else { connection.unRequestPublisher(topic); }
        }

        setExpanded(topic.expanded);
      }}
    >
      { expanded ? NTTopicExpanded(topic, connection) : NTTopicCollapsed(topic) }
    </ColoredPressable>
  );
}

/** Returns the contents of an NTTopic item, when collapsed (not expanded). */
function NTTopicCollapsed(topic: NTTopic) {
  return (
    <View style={{flexDirection: "row", flex: 1}}>
      { /* Topic name */}
      <View style={{flex: 2.5}}>
        <Text style={styles.label} numberOfLines={1}>{topic.name}</Text>
      </View>
      { /* Topic value */}
      <View style={{flex: 5}}>
        <Text style={styles.label} numberOfLines={1}>{topic.getValue()}</Text>
      </View>
      { /* Topic type */}
      <View style={{flex: 2}}>
        <Text style={styles.label} numberOfLines={1}>{topic.type}</Text>
      </View>
    </View>
  );
}

/** Returns the contents of an NTTopic item, when expanded. */
function NTTopicExpanded(topic: NTTopic, connection: NTConnection) {
  return (
    <View style={{flex: 1}}>
      { /* Topic name */}
      <View style={{flexDirection: "row"}}>
        <Text 
          style={styles.labelBold} 
          numberOfLines={1}>({topic.type})&nbsp;
        </Text>
        <Text style={styles.label} numberOfLines={1}>{topic.fullName}</Text>
      </View>
      { /* Last updated */}
      <View style={{flexDirection: "row"}}>
        <Text 
          style={styles.labelBold} 
          numberOfLines={1}>Last Update:&nbsp;
        </Text>
        <Text style={styles.label} numberOfLines={1}>{topic.lastUpdate / 1e+6}s</Text>
      </View>
      { /* Value */}
      <View style={{flexDirection: "row"}}>
        <Text 
          style={styles.labelBold} 
          numberOfLines={1}>Value:&nbsp;
        </Text>
        <Text style={styles.label} numberOfLines={1}>{topic.getValue()}</Text>
      </View>
      { /* Update */}
      { topic.editable !== NTEditType.Uneditable && (
        <View style={{flexDirection: "row"}}>
          <ColoredPressable 
            defaultColor={Colors.app.accentColor}
            hoverColor={Colors.app.accentColorDark}
            style={styles.ntTopicUpdateBttn}
            onPress={ () => editNTTopic(topic, connection) }
          >
            <Text style={styles.label}>Edit</Text>
          </ColoredPressable>
        </View>
      )}
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
    fontSize: RFPercentage(1.8)
  },
  labelBold: {
    fontFamily: "Montserrat-Bold",
    color: Colors.app.lightTextColor,
    fontSize: RFPercentage(1.8)
  },
  ntTopicUpdateBttn: {
    paddingVertical: scale(1.5),
    paddingHorizontal: scale(8),
    margin: scale(1.5)
  }
});
