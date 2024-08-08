import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import IndexScreen from ".";
import ControllerLayout from "./controller/_layout";

export type MainStackParamList = {
    Home: undefined,
    ControllerDrawer: undefined
}

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainLayout() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={ IndexScreen } />
                <Stack.Screen name="ControllerDrawer" component={ ControllerLayout } options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}