import { Drawer } from 'expo-router/drawer';
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentNTConnection } from "@/util/nt/NTComms";
import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";
import { getCurrentDSConnection } from '@/util/ds/DSComms';
import { DrawerNavigationOptions } from '@react-navigation/drawer';
import { Alert, Button } from 'react-native';
import { ConnectedSymbol, NotConnectedSymbol } from '@/constants/Constants';

/**
 * @returns The controller screen's Drawer navigator
 */
export default function ControllerLayout() {
  // Get connections
  const nt = getCurrentNTConnection();
  const ds = getCurrentDSConnection();

  if (nt == null || ds == null) {
    throw `A connection is null (nt: ${nt}, ds: ${ds})`;
  }

  // Connection info button
  const connectionInfoHeaderButton: DrawerNavigationOptions = {
    headerRight: () => (
      <Ionicons 
        name="information-circle-outline"
        size={24}
        onPress={ () => {
          Alert.alert(
            `Connected to ${nt.address}`, 
            `NT WebSocket: ${nt.isConnected() ? `Good ${ConnectedSymbol}` : `Bad ${NotConnectedSymbol}`}\n` +
            `DS UDP Socket: ${ds.socketUDP.getIsConnected() ? `Good ${ConnectedSymbol}` : `Bad ${NotConnectedSymbol}`}\n` +
            `DS TCP Socket: ${ds.socketTCP.getIsSocketOpen() ? `Good ${ConnectedSymbol}` : `Bad ${NotConnectedSymbol}`}`
          );
        }}
      />
    )
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
          drawerLabel: "DriverStation",
          ...connectionInfoHeaderButton
        }} />
      {/* NetworkTable Screen */}
      <Drawer.Screen 
        name="networktable" 
        options={{
          drawerIcon: ({focused, size}) => (
            <Ionicons name="globe" size={size} color={ focused ? Colors.app.accentColorDark : Colors.controllerDrawer.defaultItemColor } />
          ),
          drawerLabel: "NetworkTables",
          ...connectionInfoHeaderButton
        }} />
      {/* Cameras Screen */}
      <Drawer.Screen 
        name="cameras" 
        options={{
          drawerIcon: ({focused, size}) => (
            <Ionicons name="camera" size={size} color={ focused ? Colors.app.accentColorDark : Colors.controllerDrawer.defaultItemColor } />
          ),
          drawerLabel: "Cameras",
          ...connectionInfoHeaderButton
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
