import { DrawerNavigationOptions } from "@react-navigation/drawer"
import { Colors } from "./Colors"
import { scale } from "react-native-size-matters"
import { NTConnection } from "@/util/nt/NTComms"
import { ConnectedSymbol, NotConnectedSymbol } from "./Constants"

// Default Drawer options
const defaultScreenOptions: DrawerNavigationOptions = {
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

/** Creates DrawerNavigationOptions using the current NTConnection */
export function createDrawerOptions(ntConnection: NTConnection): DrawerNavigationOptions {
  var connected = ntConnection.isConnected();

  return {
    ...defaultScreenOptions,
    headerTitleStyle: {
      fontFamily: "Montserrat-Bold",
      color: connected ? "green" : "red"
    },
    headerTitle: `${ connected ? ConnectedSymbol : NotConnectedSymbol } ${ ntConnection.address }`
  }
}
