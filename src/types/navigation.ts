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
  Comprobantes:
    | {
        cuotaId?: number;
        periodo?: string;
        alumnoNombre?: string;
        saldo?: number;
      }
    | undefined;
  Servicios: undefined;
  Reportes: undefined;
  Perfil: undefined;
};

export type AdminTabParamList = {
  Reportes: undefined;
  ComprobantesAdmin: undefined;
  Perfil: undefined;
};
