import { createDrawerNavigator, DrawerNavigationOptions } from "@react-navigation/drawer";
import NetworkTableScreen from "./networktable";
import { NotConnectedSymbol } from "@/constants/Constants";
import { Colors } from "@/constants/Colors";
import { scale } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import CamerasScreen from "./cameras";
import { getCurrentNTConnection } from "@/util/nt/NTComms";

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
  var nt = getCurrentNTConnection();

  const onLoadTitle: DrawerNavigationOptions = {
    headerTitle: `${NotConnectedSymbol} ${ (nt != null) ? nt.address : "" }`,
  }

  // Layout
  return (
    <Drawer.Navigator initialRouteName="NetworkTables" screenOptions={{ ...ScreenOptions, ...onLoadTitle }}>
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

// Drawer options
const ScreenOptions: DrawerNavigationOptions = {
  // Content style
  sceneContainerStyle: {
    backgroundColor: Colors.glass.background
  },
  // Drawer style
  drawerContentStyle: {
    backgroundColor: Colors.glass.textColor
  },
  drawerInactiveTintColor: Colors.generic.darkGray,
  drawerActiveTintColor: Colors.glass.accentColorDark,
  // Header style
  headerStyle: {
    height: scale(40),
    borderBottomColor: Colors.glass.accentColor,
    borderBottomWidth: scale(2)
  },
  headerTitleStyle: {
    fontFamily: "Montserrat-Bold",
    color: "red"
  },
  headerTintColor: Colors.glass.accentColor,
}