import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import 'react-native-polyfill-globals/auto'; // Will polyfill all (for MessagePack)
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from 'expo-system-ui';
import ControllerLayout from "./controller/_layout";
import IndexScreen from "./index";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { Colors } from "@/constants/Colors";
import { Asset } from "expo-asset"

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

  // Preload fonts
  const [fontsLoaded, fontsError] = useFonts({
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf")
  });

  // Preload important images
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    async function loadImages() {
      try {
        await Promise.all([
          Asset.fromModule(require("../assets/images/dropdown-arrow.png")).downloadAsync()
        ]);
      } catch (e) {
        console.log(`Failed to prefect images: ${e}`);
      } finally {
        setImagesLoaded(true);
      }
    }

    loadImages();
  }, []);

  // Hide splash screen once everything's loaded
  useEffect(() => {
    if (imagesLoaded && (fontsLoaded || fontsError)) {
      SplashScreen.hideAsync();
    }
  }, [imagesLoaded, fontsLoaded, fontsError]);

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