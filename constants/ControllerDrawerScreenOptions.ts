import { DrawerNavigationOptions } from "@react-navigation/drawer"
import { Colors } from "./Colors"
import { scale } from "react-native-size-matters"
import { NTConnection } from "@/util/nt/NTComms"
import { ConnectedSymbol, MidConnectedSymbol, NotConnectedSymbol } from "./Constants"
import { DSConnection } from "@/util/ds/DSComms"

// Default Drawer options
const defaultScreenOptions: DrawerNavigationOptions = {
  // Content style
  sceneContainerStyle: {
    backgroundColor: Colors.app.background
  },
  // Drawer style
  drawerContentStyle: {
    backgroundColor: Colors.app.lightTextColor
  },
  drawerInactiveTintColor: Colors.controllerDrawer.defaultItemColor,
  drawerActiveTintColor: Colors.app.accentColorDark,
  // Header style
  headerStyle: {
    height: scale(40),
    borderBottomColor: Colors.app.accentColor,
    borderBottomWidth: scale(2)
  },
  headerTitleStyle: {
    fontFamily: "Montserrat-Bold",
    color: "red"
  },
  headerTintColor: Colors.app.accentColor,
}

/** Creates DrawerNavigationOptions using the current NTConnection and DSConnection */
export function createDrawerOptions(nt: NTConnection, ds: DSConnection): DrawerNavigationOptions {
  const allConnected = nt.isConnected() && ds.isConnected();
  const noConnected = !nt.isConnected() && !ds.socketUDP.getIsConnected() && !ds.socketTCP.getIsSocketOpen();

  const symbol = allConnected ? ConnectedSymbol : (noConnected ? NotConnectedSymbol : MidConnectedSymbol);

  return {
    ...defaultScreenOptions,
    headerTitleStyle: {
      fontFamily: "Montserrat-Bold",
      color: allConnected ? Colors.controllerDrawer.connectedLabel : (noConnected ? Colors.controllerDrawer.notConnectedLabel : Colors.controllerDrawer.midConnectionLabel)
    },
    headerTitle: `${ symbol } ${ nt.address }`
  }
}
