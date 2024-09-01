import { BatteryView } from "@/components/Driverstation/BatteryView";
import { ButtonColumn } from "@/components/Driverstation/ButtonColumn";
import { DSWarningMessage } from "@/components/Driverstation/DSWarningMessage";
import { EnableDisableSwitcher } from "@/components/Driverstation/EnableDisableSwitcher";
import { JoystickIndexInput } from "@/components/Driverstation/JoystickIndexInput";
import { JoystickInput } from "@/components/Driverstation/JoystickInput";
import { ModeSwitcher } from "@/components/Driverstation/ModeSwitcher";
import { RestartButtons } from "@/components/Driverstation/RestartButtons";
import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";
import { getCurrentDSConnection } from "@/util/ds/DSComms";
import { useDSConnected } from "@/util/ds/DSHooks";
import { getCurrentNTConnection } from "@/util/nt/NTComms";
import { useNTConnected } from "@/util/nt/NTHooks";
import { useDrawerStatus } from "@react-navigation/drawer";
import { useFocusEffect, useNavigation } from "expo-router";
import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** The screen for driving the robot. */
export default function DriverStationScreen() {
  const navigation = useNavigation();

  // Get connection
  const ntConnection = getCurrentNTConnection();
  const dsConnection = getCurrentDSConnection();
  
  if (ntConnection == null || dsConnection == null) {
    // This should never run
    throw `Connection is null (nt: ${ntConnection}, ds: ${dsConnection})`;
  }
  
  // Listen for status change
  const isNTConnected = useNTConnected(ntConnection);
  const isDSConnected = useDSConnected(dsConnection);

  useEffect(() => {
    navigation.setOptions(createDrawerOptions(ntConnection, dsConnection));
  }, [navigation, ntConnection, dsConnection, isNTConnected, isDSConnected]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Upper menu */}
      { (dsConnection.isConnected() && !dsConnection.state.estop) ? 
        /* Upper menu controls */
        <View style={styles.upperMenuContainer}>
          <EnableDisableSwitcher connection={dsConnection} />
          <ModeSwitcher connection={dsConnection} />
          <BatteryView connection={dsConnection} />
          <RestartButtons connection={dsConnection} />
          <JoystickIndexInput connection={dsConnection} />
        </View> :
        /* Error message */
        <View style={styles.upperMenuContainer}>
          <DSWarningMessage message={
            !dsConnection.isConnected() ? "No robot connection" : "Robot has been Emergency Stopped"
          } />
        </View>
      }
      {/* Controller */}
      <View style={styles.controlsContainer}>
        {/* Left button column */}
        <ButtonColumn 
          buttonLabels={["LT", "A", "B"]} 
          buttonSetters={[ 
            (val: boolean) => dsConnection.state.leftTrigger = val,
            (val: boolean) => dsConnection.state.aButton = val,
            (val: boolean) => dsConnection.state.bButton = val 
          ]} 
        />
        {/* Left Joystick */}
        <JoystickInput 
          xSetter={ (value: number) => dsConnection.state.leftJoystickX = value }
          ySetter={ (value: number) => dsConnection.state.leftJoystickY = value }
        />
        {/* Right Joystick */}
        <JoystickInput 
          xSetter={ (value: number) => dsConnection.state.rightJoystickX = value }
          ySetter={ (value: number) => dsConnection.state.rightJoystickY = value }
        />
        {/* Right button column */}
        <ButtonColumn 
          buttonLabels={["RT", "X", "Y"]} 
          buttonSetters={[ 
            (val: boolean) => dsConnection.state.rightTrigger = val,
            (val: boolean) => dsConnection.state.xButton = val,
            (val: boolean) => dsConnection.state.yButton = val 
          ]} 
        />
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
  },
  /* Upper Menu */
  upperMenuContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  /* Controls */
  controlsContainer: {
    flexDirection: "row",
    flex: 1,
    margin: 5,
  }
});
