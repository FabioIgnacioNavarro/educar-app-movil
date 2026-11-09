import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";

import { LoginScreen } from "../screens/auth/LoginScreen";
import { CuotasScreen } from "../screens/cuotas/CuotasScreen";
import {
  AdminComprobantesScreen,
  ComprobantesScreen,
} from "../screens/comprobantes/ComprobantesScreen";
import { ServiciosScreen } from "../screens/servicios/ServiciosScreen";
import { ReportesScreen } from "../screens/reportes/ReportesScreen";
import { PerfilScreen } from "../screens/perfil/PerfilScreen";

import {
  AuthStackParamList,
  MainTabParamList,
  AdminTabParamList,
} from "../types/navigation";

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const AdminTabs = createBottomTabNavigator<AdminTabParamList>();

function BrandHeaderTitle() {
  return (
    <View style={styles.brandHeaderContainer}>
      <Text style={styles.brandHeaderEducar}>Educar </Text>
      <Text style={styles.brandHeaderPara}>para </Text>
      <Text style={styles.brandHeaderTransformar}>Transformar</Text>
    </View>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);
  const barHeight = 56 + bottomPadding;

  return (
    <MainTabs.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 3,
        },
        headerTitleAlign: "center",
        headerTitle: () => <BrandHeaderTitle />,
        tabBarActiveTintColor: "#1D66C2",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          height: barHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <MainTabs.Screen
        name="Cuotas"
        component={CuotasScreen}
        options={{
          title: "Cuotas",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "receipt" : "receipt-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <MainTabs.Screen
        name="Comprobantes"
        component={ComprobantesScreen}
        options={{
          title: "Comprobantes",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cloud-upload" : "cloud-upload-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <MainTabs.Screen
        name="Servicios"
        component={ServiciosScreen}
        options={{
          title: "Servicios",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "school" : "school-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <MainTabs.Screen
        name="Reportes"
        component={ReportesScreen}
        options={{
          title: "Reportes",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <MainTabs.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          title: "Mi Perfil",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </MainTabs.Navigator>
  );
}

function AdminTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);
  const barHeight = 56 + bottomPadding;

  return (
    <AdminTabs.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 3,
        },
        headerTitleAlign: "center",
        headerTitle: () => <BrandHeaderTitle />,
        tabBarActiveTintColor: "#1D66C2",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          height: barHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <AdminTabs.Screen
        name="Reportes"
        component={ReportesScreen}
        options={{
          title: "Reportes",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <AdminTabs.Screen
        name="ComprobantesAdmin"
        component={AdminComprobantesScreen}
        options={{
          title: "Validar Pagos",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "checkmark-done-circle" : "checkmark-done-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <AdminTabs.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          title: "Mi Perfil",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </AdminTabs.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Iniciando Educar Móvil..." />;
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  if (user?.rol === "Administrador") {
    return <AdminTabNavigator />;
  }

  return <MainTabNavigator />;
}

const styles = StyleSheet.create({
  brandHeaderContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  brandHeaderEducar: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1D66C2", // Azul institucional
    letterSpacing: 0.3,
  },
  brandHeaderPara: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  brandHeaderTransformar: {
    fontSize: 18,
    fontWeight: "800",
    color: "#EC058F", // Magenta institucional
    letterSpacing: 0.3,
  },
});
