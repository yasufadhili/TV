import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';

const AppLayout = () => (
  <>
    <StatusBar style={"light"} />
    <Layout />
  </>
);

const Layout = () => (
  <ThemeProvider value={DarkTheme} >
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: "#100F10"
      },
      headerTitleStyle: {
        fontSize: 24,
        fontWeight: "bold"
      },
    }} />
  </ThemeProvider>
);

export default AppLayout;