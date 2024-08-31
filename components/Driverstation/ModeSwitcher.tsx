import { DSConnection } from "@/util/ds/DSComms"
import { View, StyleSheet } from "react-native";
import { scale } from "react-native-size-matters";
import { ColoredPressableWithText } from "../ColoredPressable";
import { Colors } from "@/constants/Colors";
import { useRobotMode } from "@/util/ds/DSHooks";
import { ControlMode } from "@/util/ds/RobotState";
import { DSEvents } from "@/util/ds/DSEvents";
import { RFPercentage } from "react-native-responsive-fontsize";

type ModeSwitcherProps = {
  connection: DSConnection
}

/** Switches the robot's mode */
function switchRobotMode(connection: DSConnection, newMode: ControlMode) {
  // Check that the mode is actually changing
  if (connection.state.mode === newMode) { return; }

  if (connection.state.enabled) {
    // Must disable first
    connection.state.enabled = false;
    connection.events.emit(DSEvents.RobotEnabledStateChanged);
  }

  connection.state.mode = newMode;
  connection.events.emit(DSEvents.RobotModeChanged);
}

type SwitchModeButtonProps = {
  connection: DSConnection,
  title: string,
  currentMode: ControlMode,
  buttonMode: ControlMode
}

/** Renders a single button for the mode switcher */
function SwitchModeButton(props: SwitchModeButtonProps) {
  return (
    <ColoredPressableWithText 
      defaultColor={ (props.currentMode === props.buttonMode) ? Colors.app.accentColor : "gray" } 
      hoverColor={ Colors.app.accentColor }
      style={ styles.ModePressable }
      text={props.title}
      textStyle={ styles.ModeText }
      textHoveredStyle={{ color: Colors.app.lightTextColor }}
      textNotHoveredStyle={{ color: (props.currentMode === props.buttonMode) ? Colors.app.lightTextColor : "black" }}
      onPress={ () => switchRobotMode(props.connection, props.buttonMode) }
    />
  );
}

/** Switcher to change robot's mode between teleop, autonomous, and test */
export function ModeSwitcher({connection}: ModeSwitcherProps) {
  const mode = useRobotMode(connection);

  return (
    <View style={styles.container}>
      <SwitchModeButton 
        connection={connection} 
        title={"Teleop"} 
        currentMode={mode} 
        buttonMode={ControlMode.Teleop}
      />
      <SwitchModeButton 
        connection={connection} 
        title={"Autonomous"} 
        currentMode={mode} 
        buttonMode={ControlMode.Autonomous}
      />
      <SwitchModeButton 
        connection={connection} 
        title={"Test"} 
        currentMode={mode} 
        buttonMode={ControlMode.Test}
      />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    height: scale(65),
    width: scale(140),
    margin: 5,
    justifyContent: "center",
    flexDirection: "column"
  },
  ModePressable: {
    flex: 1,
    justifyContent: "center"
  },
  ModeText: {
    fontFamily: "Montserrat",
    textAlign: "center",
    fontSize: RFPercentage(1.5)
  }
});
