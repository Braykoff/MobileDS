import { createDrawerNavigator, DrawerNavigationOptions } from "@react-navigation/drawer";
import NetworkTableScreen from "./networktable";
import { RobotState } from "@/components/frc/StateManager";

export type ControllerDrawerParamList = {
    networktable: undefined
};

const Drawer = createDrawerNavigator<ControllerDrawerParamList>();

export default function ControllerLayout() {
    // Header setup
    const headerOptions: DrawerNavigationOptions = {
        headerTitle: `🔴 ${RobotState.Address}`,
        headerTitleStyle: {
            fontFamily: "Montserrat-Bold"
        }
    }

    return (
        <Drawer.Navigator initialRouteName="networktable">
            <Drawer.Screen name="networktable" component={ NetworkTableScreen } options={ headerOptions } />
        </Drawer.Navigator>
    );
}