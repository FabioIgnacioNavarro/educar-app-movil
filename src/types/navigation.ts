export type RootStackParamList = {
  Auth: undefined;
  MainTutor: undefined;
  MainAdmin: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  PasswordReset: undefined;
};

export type MainTabParamList = {
  Cuotas: undefined;
  Comprobantes: { facturaId?: number } | undefined;
  Servicios: undefined;
  Perfil: undefined;
};

export type AdminTabParamList = {
  Reportes: undefined;
  ComprobantesAdmin: undefined;
  Perfil: undefined;
};
