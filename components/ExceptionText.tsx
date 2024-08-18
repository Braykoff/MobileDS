import { View, Text, StyleSheet } from "react-native";

/** Creates a view with the error message in red text. Use in worst-case scenarios. */
export function ExceptionText(message: string) {
  return (
    <View style={styles.view}>
      <Text style={styles.text}>{message}. Please restart the app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  },
  text: {
    color: "red",
    fontWeight: "bold",
    fontFamily: "Montserrat-Bold",
    flex: 1,
    textAlign: "center",
    fontSize: 22
  }
});
