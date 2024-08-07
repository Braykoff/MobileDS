import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import NetworkTableScreen from "./networktable";

export type ControllerDrawerParamList = {
    NetworkTable: undefined
};

const Drawer = createDrawerNavigator<ControllerDrawerParamList>();

export default function Layout() {
    return (
        <NavigationContainer independent={ true }>
            <Drawer.Navigator initialRouteName="NetworkTable">
                <Drawer.Screen name="NetworkTable" component={ NetworkTableScreen } />
            </Drawer.Navigator>
        </NavigationContainer>
    )
}