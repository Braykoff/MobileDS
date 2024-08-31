import { Colors } from "@/constants/Colors"
import { DSConnection } from "@/util/ds/DSComms"
import { useTimerRefresh } from "@/util/TimerHook"
import { StyleSheet, View, Text } from "react-native"
import { RFPercentage } from "react-native-responsive-fontsize"
import { scale } from "react-native-size-matters"

type BatteryViewProps = {
  connection: DSConnection
}

/** Convert battery voltage to rounded percentage 0 - 100 */
function batteryVoltageToPercentage(voltage: number): number {
  return Math.trunc(Math.max(Math.min(voltage/12*100, 100), 0));
}

/** Convert battery voltage to background color */
function batteryVoltageToColor(voltage: number): string {
  if (voltage >= 10.5) { return Colors.driverStation.goodBattery; }
  else if (voltage >= 8) { return Colors.driverStation.okBattery; }
  else { return Colors.driverStation.badBattery; }
}

/** The component that displays the battery voltage in the driverstation */
export function BatteryView({connection}: BatteryViewProps) {
  useTimerRefresh(500); // Refresh every .5 seconds

  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.batteryFill,
          {
            height: `${batteryVoltageToPercentage(connection.state.batteryVoltage)}%`,
            backgroundColor: batteryVoltageToColor(connection.state.batteryVoltage)
          }
        ]}
      />
      <Text style={styles.text}>{Math.round(connection.state.batteryVoltage * 100)/100}&nbsp;V</Text>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    height: scale(65),
    width: scale(120),
    borderWidth: 2,
    margin: 5,
    backgroundColor: "darkgray",
    borderColor: "white",
    justifyContent: "center"
  },
  batteryFill: {
    backgroundColor: "red",
    width: "100%",
    position: "absolute",
    bottom: 0,
    zIndex: 0
  },
  text: {
    fontFamily: "Montserrat",
    fontSize: RFPercentage(3),
    color: "black",
    textAlign: "center",
    position: "absolute",
    width: "100%",
    zIndex: 1
  }
});
