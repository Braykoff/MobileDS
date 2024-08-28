import { Drawer } from 'expo-router/drawer';
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentNTConnection } from "@/util/nt/NTComms";
import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";
import { getCurrentDSConnection } from '@/util/ds/DSComms';

//const Drawer = createDrawerNavigator<ControllerDrawerParamList>();
/**
 * @returns The controller screen's Drawer navigator
 */
export default function ControllerLayout() {
  // Header title setup
  const nt = getCurrentNTConnection();
  const ds = getCurrentDSConnection();

  if (nt == null || ds == null) {
    throw `A connection is null (nt: ${nt}, ds: ${ds})`;
  }

  // Layout
  return (
    <Drawer initialRouteName="networktable" screenOptions={ createDrawerOptions(nt, ds) }>
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
      {/* Disconnect */}
      <Drawer.Screen
        name="disconnect"
        options={{
          drawerIcon: ({focused, size}) => (
            <Ionicons name="exit" size={size} color={ Colors.controllerDrawer.disconnectButtonColor } />
          ),
          drawerLabel: "Disconnect",
          drawerLabelStyle: {
            color: Colors.controllerDrawer.disconnectButtonColor
          }
        }} />
    </Drawer>
  );
}
