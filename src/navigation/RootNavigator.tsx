import React from "react";
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
        headerStyle: { backgroundColor: "#1E3A8A" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold" },
        tabBarActiveTintColor: "#1E3A8A",
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
        headerStyle: { backgroundColor: "#1E3A8A" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold" },
        tabBarActiveTintColor: "#1E3A8A",
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
