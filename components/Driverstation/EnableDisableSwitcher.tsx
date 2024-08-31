import { DSConnection } from "@/util/ds/DSComms";
import { DSEvents } from "@/util/ds/DSEvents";
import { useRobotEnabled } from "@/util/ds/DSHooks";
import { StyleSheet, Alert } from "react-native"
import { RFPercentage } from "react-native-responsive-fontsize";
import { scale } from "react-native-size-matters";
import { ColoredPressableWithText } from "../ColoredPressable";
import { Colors } from "@/constants/Colors";

const colors = Colors.driverStation; // Shorthand

type EnabledDisabledSwitcherProps = {
  connection: DSConnection
}

/** Toggles robot's enabled/disable state */
function toggleEnabled(connection: DSConnection) {
  if (connection.state.enabled) {
    // Need to disable
    connection.state.enabled = false;
  } else {
    // Need to enable
    if (!connection.isConnected()) {
      Alert.alert(
        "Unable to enable", 
        `Please check you connection to the robot.\n(UDP connection is ` +
        `${connection.socketUDP.getIsConnected() ? "good" : "bad"}, TCP connection is ` +
        `${connection.socketTCP.getIsSocketOpen() ? "good" : "bad"})`
      );
      return;
    }
    connection.state.enabled = true;
  }

  connection.events.emit(DSEvents.RobotEnabledStateChanged); // Refresh
}

/** The enabled/disabled switcher in the driverstation tab */
export function EnableDisableSwitcher({connection}: EnabledDisabledSwitcherProps) {
  const enabled = useRobotEnabled(connection);

  return (
    <ColoredPressableWithText 
      style={[
        styles.container,
        {borderColor: enabled ? colors.enabledDark : colors.disabledDark}
      ]}
      defaultColor={ enabled ? colors.enabledLight : colors.disabledLight }
      hoverColor={ enabled ? colors.enabledDark : colors.disabledDark }
      text={ enabled ? "Enabled" : "Disabled" }
      textStyle={styles.text}
      textNotHoveredStyle={{ color: enabled ? colors.enabledDark : colors.disabledDark }}
      textHoveredStyle={{ color: enabled ? colors.enabledLight : colors.disabledLight }}
      onPress={ () => toggleEnabled(connection) }
    />
  )
}

const styles = StyleSheet.create({
  container: {
    height: scale(65),
    justifyContent: "center",
    width: scale(140),
    borderWidth: 2,
    margin: 5
  },
  text: {
    fontFamily: "Montserrat-Bold",
    fontSize: RFPercentage(3),
    textAlign: "center"
  }
});
