import { Tabs } from 'expo-router';
import { ColorValue, Text } from 'react-native';

import { colors } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.backgroundElevated,
          borderTopColor: colors.borderSubtle,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Heute', tabBarIcon: ({ color }) => <TabGlyph symbol="●" color={color} /> }}
      />
      <Tabs.Screen
        name="plan"
        options={{ title: 'Plan', tabBarIcon: ({ color }) => <TabGlyph symbol="▦" color={color} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Fortschritt', tabBarIcon: ({ color }) => <TabGlyph symbol="▲" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: ({ color }) => <TabGlyph symbol="◍" color={color} /> }}
      />
    </Tabs>
  );
}

function TabGlyph({ symbol, color }: { symbol: string; color: ColorValue }) {
  return <Text style={{ fontSize: 18, color }}>{symbol}</Text>;
}
