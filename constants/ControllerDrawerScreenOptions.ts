import { DrawerNavigationOptions } from "@react-navigation/drawer"
import { Colors } from "./Colors"
import { scale } from "react-native-size-matters"
import { NTConnection } from "@/util/nt/NTComms"
import { ConnectedSymbol, NotConnectedSymbol } from "./Constants"

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

/** Creates DrawerNavigationOptions using the current NTConnection */
export function createDrawerOptions(connection: NTConnection): DrawerNavigationOptions {
  var connected = connection.isConnected();

  return {
    ...defaultScreenOptions,
    headerTitleStyle: {
      fontFamily: "Montserrat-Bold",
      color: connected ? Colors.controllerDrawer.connectedLabel : Colors.controllerDrawer.notConnectedLabel
    },
    headerTitle: `${ connected ? ConnectedSymbol : NotConnectedSymbol } ${ connection.address }`
  }
}
