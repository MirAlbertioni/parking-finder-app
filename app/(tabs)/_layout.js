import { Tabs } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.subtext,
        tabBarStyle: { backgroundColor: Colors.white },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{ title: 'Karta', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="list"
        options={{ title: 'Lista', tabBarIcon: () => null }}
      />
    </Tabs>
  );
}
