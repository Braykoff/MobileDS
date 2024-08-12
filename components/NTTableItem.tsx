import { Colors } from "@/constants/Colors";
import { NTItem, NTTable } from "@/util/nt/NTData"
import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { scale } from "react-native-size-matters";

type NTTableItemProps = {
  contents: NTItem
}

export function NTTableItem({ contents }: NTTableItemProps) {
  const [isHovering, setHovering] = useState(false);

  if (contents instanceof NTTable) {
    // This is a NTTable
    return (
      <Pressable 
        style={[styles.item, styles.ntTableRow, { backgroundColor: !isHovering ? Colors.app.accentColor : Colors.app.accentColorDark }]}
        onPressIn={ () => setHovering(true) }
        onPressOut={ () => setHovering(false) }
      >
        <Text style={[styles.label, styles.ntTableLabel]}>{contents.name}</Text>
      </Pressable>
    );
  } else {
    // This is a NTTopic
    return (
      <View style={styles.item}>
        <Text style={styles.label}>NTTopic: {contents.name}</Text>
      </View>
    );
  }
}

// Style
const styles = StyleSheet.create({
  /** Generic NTItem styling */
  item: {
    padding: scale(4),
    margin: scale(2),
    flexDirection: "column"
  },
  label: {
    fontFamily: "Montserrat-Regular",
    fontSize: RFPercentage(2),
  },
  /** NTTable styling */
  ntTableRow: {
    
  },
  ntTableLabel: {
    color: Colors.app.lightTextColor
  }
});