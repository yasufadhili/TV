import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from "react-native-gesture-handler";

const AppLayout = () => (
  <>
    <StatusBar style={"light"} />
    <Layout />
  </>
);

const Layout = () => (
  <ThemeProvider value={DarkTheme} >
    <GestureHandlerRootView
      style={{flex: 1}}
    >
      <Stack screenOptions={{
        headerStyle: {
          backgroundColor: "#100F10"
        },
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: "bold"
        },
      }} />
    </GestureHandlerRootView>
  </ThemeProvider>
);

export default AppLayout;