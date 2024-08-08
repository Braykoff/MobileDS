import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from 'expo-system-ui';
import ControllerLayout from "./controller/_layout";
import IndexScreen from "./index";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { Colors } from "@/constants/Colors";

SplashScreen.preventAutoHideAsync(); // Keep showing splash screen (until fonts loaded)

export type MainStackParamList = {
    index: undefined,
    controller: undefined
}

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainLayout() {
  // Set default background
  SystemUI.setBackgroundColorAsync( Colors.glass.background );

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
    <Stack.Navigator initialRouteName="index">
      <Stack.Screen name="index" component={ IndexScreen } options={{ headerShown: false }} />
      <Stack.Screen name="controller" component={ ControllerLayout } options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}