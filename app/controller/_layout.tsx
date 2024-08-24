import { Drawer } from 'expo-router/drawer';
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentNTConnection } from "@/util/nt/NTComms";
import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";

//const Drawer = createDrawerNavigator<ControllerDrawerParamList>();
/**
 * @returns The controller screen's Drawer navigator
 */
export default function ControllerLayout() {
  // Header title setup
  const nt = getCurrentNTConnection();

  if (nt == null) {
    throw "NT connection is null";
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
