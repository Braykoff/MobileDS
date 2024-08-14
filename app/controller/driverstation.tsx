import { DrawerNavigationProp } from "@react-navigation/drawer";
import { ControllerDrawerParamList } from "./_layout";
import { View } from "react-native";

// Init navigation
type NetworkTableScreenNavigationProp = DrawerNavigationProp<ControllerDrawerParamList, "DriverStation">;
type Props = { navigation: NetworkTableScreenNavigationProp }

/** The screen for driving the robot. */
export function DriverStationScreen() {
  return (
    <View></View>
  );
}