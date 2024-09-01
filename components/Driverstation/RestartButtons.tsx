import { DSConnection } from "@/util/ds/DSComms";
import { StyleSheet, View } from "react-native"
import { scale } from "react-native-size-matters";
import { ColoredPressableWithText } from "../ColoredPressable";
import { Colors } from "@/constants/Colors";
import { RFPercentage } from "react-native-responsive-fontsize";

type RestartButtonsProps = {
  connection: DSConnection
}

/** Restart code and restart robot buttons */
export function RestartButtons({connection}: RestartButtonsProps) {
  return (
    <View style={styles.container}>
      {/* Restart Code Button */}
      <ColoredPressableWithText 
        defaultColor={ "gray" } 
        hoverColor={ Colors.app.accentColor }
        style={ styles.option }
        text={"Restart Code"}
        textStyle={ styles.optionText }
        onPress={ () => {
          connection.setEnabled(false);
          connection.state.requestCodeRestart = true;
        } }
      />
      {/* Reboot Button */}
      <ColoredPressableWithText 
        defaultColor={ "gray" } 
        hoverColor={ Colors.app.accentColor }
        style={ styles.option }
        text={"Reboot Controller"}
        textStyle={ styles.optionText }
        onPress={ () => {
          connection.setEnabled(false);
          connection.state.requestRoboRIOReboot = true;
        } }
      />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    height: scale(65),
    width: scale(120),
    margin: 5,
    justifyContent: "center",
    flexDirection: "column"
  },
  option: {
    flex: 1,
    justifyContent: "center"
  },
  optionText: {
    fontFamily: "Montserrat",
    textAlign: "center",
    fontSize: RFPercentage(1.5)
  }
});
