import { Text ,View, StyleSheet, Alert, Dimensions } from "react-native";
import { LargeButton } from "@/components/LargeButton";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync(); // Keep showing splash screen

export default function Index() {
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

  return (
    // Entire screen
    <SafeAreaView style={styles.outerContainer} edges={[]}>
      { /* Vertical column */}
      <View style={styles.verticalContainer}>
        { /* Title */}
        <Text style={styles.title} adjustsFontSizeToFit={true} numberOfLines={1}>MobileDS</Text>
        {/* First button row */}
        <View style={styles.buttonRow}>
          <LargeButton onclick={() => alert("!") } color={"darkgray"} label={"Button 1"} />
          <LargeButton onclick={() => alert("!") } color={"darkgray"} label={"Button 1"} />
        </View>
        {/* Second button row */}
        <View style={styles.buttonRow}>
          <LargeButton onclick={() => alert("!") } color={"darkgray"} label={"Button 1"} />
          <LargeButton onclick={() => alert("!") } color={"darkgray"} label={"Button 1"} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* Outer container */
  outerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  /* Vertical container */
  verticalContainer: {
    width: "80%",
    height: "70%",
    alignItems: "center",
    flexDirection: "column",
  },
  /* Title text */
  title: {
    flex: 2,
    width: "100%",
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
    fontSize: 100
  },
  /* Rows of buttons */
  buttonRow: {
    flex: 5,
    flexDirection: "row",
    width: "100%",
  }
});