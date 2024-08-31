import { polyfill as polyfillEncoding } from "react-native-polyfill-globals/src/encoding"
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from 'expo-system-ui';
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { Colors } from "@/constants/Colors";
import { Asset } from "expo-asset"
import { Stack } from "expo-router";

console.log("App has started");
SplashScreen.preventAutoHideAsync(); // Keep showing splash screen (until fonts loaded)
polyfillEncoding(); // Globally polyfill encoding for MessagePack

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
    <Stack initialRouteName="index" screenOptions={{
      contentStyle: {
        backgroundColor: Colors.app.background
      },
      headerShown: false
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="controller" options={{ headerShown: false }} />
    </Stack>
  );
}
