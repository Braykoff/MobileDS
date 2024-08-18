import { DrawerNavigationOptions } from "@react-navigation/drawer";
import { Drawer } from 'expo-router/drawer';
import { ConnectedSymbol, NotConnectedSymbol } from "@/constants/Constants";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentNTConnection } from "@/util/nt/NTComms";
import { ExceptionText } from "@/components/ExceptionText";
import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";

//const Drawer = createDrawerNavigator<ControllerDrawerParamList>();
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
    <Drawer initialRouteName="networktable" screenOptions={ createDrawerOptions(nt) }>
      {/* Driverstation Screen */}
      <Drawer.Screen 
        name="driverstation" 
        options={{
          drawerIcon: ({focused, size}) => (
            <Ionicons name="game-controller" size={size} color={ focused ? Colors.app.accentColorDark : Colors.controllerDrawer.defaultItemColor } />
          ),
          drawerLabel: "DriverStation"
        }} />
      {/* NetworkTable Screen */}
      <Drawer.Screen 
        name="networktable" 
        options={{
          drawerIcon: ({focused, size}) => (
            <Ionicons name="globe" size={size} color={ focused ? Colors.app.accentColorDark : Colors.controllerDrawer.defaultItemColor } />
          ),
          drawerLabel: "NetworkTables"
        }} />
      {/* Cameras Screen */}
      <Drawer.Screen 
        name="cameras" 
        options={{
          drawerIcon: ({focused, size}) => (
            <Ionicons name="camera" size={size} color={ focused ? Colors.app.accentColorDark : Colors.controllerDrawer.defaultItemColor } />
          ),
          drawerLabel: "Cameras"
        }} />
    </Drawer>
  );
}
