import { Colors } from "@/constants/Colors";
import { View, Text, StyleSheet } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { scale } from "react-native-size-matters";

/** Rendered in the NetworkTable screen when no table is connected */
export function NTTableEmptyItem() {
  return (
    <View style={styles.item}>
      <Text style={styles.label}>No NetworkTables Connection</Text>
    </View>
  )
}

// Styles
const styles = StyleSheet.create({
  item: {
    padding: scale(4),
    margin: scale(2),
    backgroundColor: Colors.app.accentColor
  },
  label: {
    fontFamily: "Montserrat-Bold",
    color: Colors.app.lightTextColor,
    fontSize: RFPercentage(2),
    textAlign: "center"
  }
});
