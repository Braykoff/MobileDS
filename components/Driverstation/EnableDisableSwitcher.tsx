import { DSConnection } from "@/util/ds/DSComms";
import { useRobotEnabled } from "@/util/ds/DSHooks";
import { StyleSheet } from "react-native"
import { RFPercentage } from "react-native-responsive-fontsize";
import { scale } from "react-native-size-matters";
import { ColoredPressableWithText } from "../ColoredPressable";
import { Colors } from "@/constants/Colors";

const colors = Colors.driverStation; // Shorthand

type EnabledDisabledSwitcherProps = {
  connection: DSConnection
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
      onPress={ () => connection.setEnabled(!enabled) }
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
