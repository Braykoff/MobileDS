import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import 'react-native-polyfill-globals/auto'; // Will polyfill all (for MessagePack)
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from 'expo-system-ui';
import ControllerLayout from "./controller/_layout";
import IndexScreen from "./index";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { Colors } from "@/constants/Colors";

SplashScreen.preventAutoHideAsync(); // Keep showing splash screen (until fonts loaded)

// Init stack
export type MainStackParamList = {
    index: undefined,
    controller: undefined
}

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * @returns The app's main Stack layout
 */
export default function MainLayout() {
  // Set default background
  SystemUI.setBackgroundColorAsync(Colors.app.background);

  // Load fonts
  const [loaded, error] = useFonts({
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf")
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Build default Stack navigator
  return (
    <Stack.Navigator initialRouteName="index" screenOptions={ ScreenOptions }>
      <Stack.Screen name="index" component={ IndexScreen } options={{ headerShown: false }} />
      <Stack.Screen name="controller" component={ ControllerLayout } options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// Stack options
const ScreenOptions: NativeStackNavigationOptions = {
  contentStyle: {
    backgroundColor: Colors.app.background
  }
}