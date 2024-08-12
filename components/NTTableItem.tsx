import { Colors } from "@/constants/Colors";
import { NTItem, NTTable } from "@/util/nt/NTData"
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { scale } from "react-native-size-matters";

type NTTableItemProps = {
  contents: NTItem
}

export function NTTableItem({ contents }: NTTableItemProps) {
  const [isHovering, setHovering] = useState(false);

  if (contents instanceof NTTable) {
    // This is a NTTable
    const [getImageSize, setImageSize] = useState(0.0);

    return (
      <Pressable 
        style={[styles.item, styles.ntTableRow, { 
          backgroundColor: !isHovering ? Colors.app.accentColor : Colors.app.accentColorDark, 
          marginLeft: getImageSize * Math.min(contents.depth - 1, 6) // Indentation
        }]}
        onPressIn={ () => setHovering(true) }
        onPressOut={ () => setHovering(false) }
      >
        <Image 
          style={[styles.ntDropdownArrow, {
            height: getImageSize,
            width: getImageSize,
            transform: [{ rotate: `${ contents.expanded ? 90 : 0 }deg` }]
          }]}
          source={require("../assets/images/dropdown-arrow.png")} />
        <View style={{flex: 1}}>
          <Text 
            style={[styles.label, styles.ntTableLabel]} 
            numberOfLines={1}
            onLayout={(event) => { setImageSize(event.nativeEvent.layout.height);}}>
              {contents.name}
          </Text>
        </View>
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
    flexDirection: "row"
  },
  label: {
    fontFamily: "Montserrat-Regular",
    fontSize: RFPercentage(2),
  },
  /** NTTable styling */
  ntTableRow: {

  },
  ntTableLabel: {
    color: Colors.app.lightTextColor,
  },
  ntDropdownArrow: {
    tintColor: Colors.app.lightTextColor,
    marginRight: scale(3),
  }
});