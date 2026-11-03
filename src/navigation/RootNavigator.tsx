import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";

import { LoginScreen } from "../screens/auth/LoginScreen";
import { CuotasScreen } from "../screens/cuotas/CuotasScreen";
import { ComprobantesScreen } from "../screens/comprobantes/ComprobantesScreen";
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
  return (
    <MainTabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1E3A8A" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold" },
        tabBarActiveTintColor: "#1E3A8A",
        tabBarInactiveTintColor: "#64748B",
      }}
    >
      <MainTabs.Screen
        name="Cuotas"
        component={CuotasScreen}
        options={{ title: "Cuotas" }}
      />
      <MainTabs.Screen
        name="Comprobantes"
        component={ComprobantesScreen}
        options={{ title: "Comprobantes" }}
      />
      <MainTabs.Screen
        name="Servicios"
        component={ServiciosScreen}
        options={{ title: "Servicios" }}
      />
      <MainTabs.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ title: "Mi Perfil" }}
      />
    </MainTabs.Navigator>
  );
}

function AdminTabNavigator() {
  return (
    <AdminTabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1E3A8A" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold" },
        tabBarActiveTintColor: "#1E3A8A",
        tabBarInactiveTintColor: "#64748B",
      }}
    >
      <AdminTabs.Screen
        name="Reportes"
        component={ReportesScreen}
        options={{ title: "Reportes" }}
      />
      <AdminTabs.Screen
        name="ComprobantesAdmin"
        component={ComprobantesScreen}
        options={{ title: "Validar Pagos" }}
      />
      <AdminTabs.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ title: "Mi Perfil" }}
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
