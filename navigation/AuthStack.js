import { createStackNavigator } from "@react-navigation/stack";
import { WelcomeScreen } from "../screens/WelcomeScreen";

const Stack = createStackNavigator();

export default function AuthStack () {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name = "WelcomeScreen"
                component={WelcomeScreen}
            />
        </Stack.Navigator>
    );
}
