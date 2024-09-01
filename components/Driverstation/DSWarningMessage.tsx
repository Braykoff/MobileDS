import { View, StyleSheet, Text } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { scale } from "react-native-size-matters";

type DSWarningMessageProps = {
  message: string
}

/** Displays a warning message instead of the controls */
export function DSWarningMessage({message}: DSWarningMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    height: scale(65),
    margin: 5,
    flex: 1,
    justifyContent: "center",
    flexDirection: "column"
  },
  message: {
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    color: "red",
    fontSize: RFPercentage(2.5)
  }
});
