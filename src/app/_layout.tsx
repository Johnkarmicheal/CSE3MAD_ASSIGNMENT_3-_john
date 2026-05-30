import { useTheme } from "@/theme";

import { Stack } from "expo-router";
import { Pressable } from "react-native";

export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackButtonDisplayMode: "minimal",
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: colors.title,
        headerTitle: "STEMM Labs Games",
        headerTitleAlign: "center",
        headerRight: () => (
          <Pressable onPress={() => console.log("Menu Pressed")}></Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="team"
        options={{
          presentation: "pageSheet",
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen name="team-view" />
      <Stack.Screen
        name="recordvideo"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="videoresults"
        options={{
          headerShown: false,
          gestureEnabled: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="record"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="results"
        options={{
          headerShown: false,
          gestureEnabled: false,
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
