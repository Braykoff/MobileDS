import { createDrawerNavigator, DrawerNavigationOptions } from "@react-navigation/drawer";
import NetworkTableScreen from "./networktable";
import { ConnectedSymbol, NotConnectedSymbol } from "@/constants/Constants";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import CamerasScreen from "./cameras";
import { getCurrentNTConnection } from "@/util/nt/NTComms";
import { ExceptionText } from "@/components/ExceptionText";
import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";

// Init drawer
export type ControllerDrawerParamList = {
  NetworkTables: undefined,
  Cameras: undefined
};

const Drawer = createDrawerNavigator<ControllerDrawerParamList>();
/**
 * @returns The controller screen's Drawer navigator
 */
export default function ControllerLayout() {
  // Header title setup
  const nt = getCurrentNTConnection();

  if (nt == null) {
    return ExceptionText("There is no current NT connection");
  }

  const onLoadTitle: DrawerNavigationOptions = {
    headerTitle: `${nt.isConnected() ? ConnectedSymbol : NotConnectedSymbol} ${ nt.address }`
  }

  // Layout
  return (
    <Drawer.Navigator initialRouteName="NetworkTables" screenOptions={ createDrawerOptions(nt) }>
      {/* NetworkTable Screen */}
      <Drawer.Screen 
        name="NetworkTables" 
        component={ NetworkTableScreen } 
        options={{
          drawerIcon: ({focused, size}) => (
            <Ionicons name="globe" size={size} color={ focused ? Colors.glass.accentColorDark : Colors.generic.darkGray } />
          )}} />
      {/* Cameras Screen */}
      <Drawer.Screen 
        name="Cameras" 
        component={ CamerasScreen } 
        options={{
          drawerIcon: ({focused, size}) => (
            <Ionicons name="camera" size={size} color={ focused ? Colors.glass.accentColorDark : Colors.generic.darkGray } />
          )}} />
    </Drawer.Navigator>
  );
}
