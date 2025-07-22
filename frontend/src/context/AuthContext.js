// frontend/src/context/AuthContext.js

import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useEffect,
  useMemo 
} from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado inicial con permisos
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem('token');
    const firstLogin = localStorage.getItem('firstLogin') === 'true';
    
    return {
      user: null,
      token,
      permisos: [],
      firstLogin,
      isAuthenticated: false,
      isLoading: !!token
    };
  });

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('firstLogin');
    delete axios.defaults.headers.common['Authorization'];
    setAuthState({
      user: null,
      token: null,
      permisos: [],
      firstLogin: false,
      isAuthenticated: false,
      isLoading: false
    });
    window.location.href = '/login';
  }, []);

  // Configurar headers de axios
  useEffect(() => {
    if (authState.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authState.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [authState.token]);

  // Login
  const login = useCallback((jwt, firstLogin = false, userData = null, permisos = []) => {
    localStorage.setItem('token', jwt);
    localStorage.setItem('firstLogin', firstLogin);

    const destino = userData?.atr_id_rol === 1
      ? '/citas'
      : !userData?.atr_2fa_enabled && userData?.atr_primer_ingreso
        ? '/setup-2fa'
        : '/dashboard';

    setAuthState({
      user: userData || null,
      token: jwt,
      permisos: permisos || [],
      firstLogin,
      isAuthenticated: true,
      isLoading: false
    });

    window.location.href = destino;
  }, []);

  // Obtener datos de usuario y permisos
  const fetchUserData = useCallback(async () => {
    if (!authState.token) return;
    try {
      const response = await axios.get('/api/auth/me');
      // La API YA retorna user + permisos como propiedades raíz
      const userData = { ...response.data };
      delete userData.permisos; // Separamos los permisos explícitamente
      const permisos = response.data.permisos || [];
      setAuthState(prev => ({
        ...prev,
        user: userData,
        permisos,
        isAuthenticated: true,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      logout();
    }
  }, [authState.token, logout]);

  useEffect(() => {
    const validateToken = async () => {
      if (authState.token && !authState.user) {
        try {
          await fetchUserData();
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      } else if (!authState.token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    validateToken();
    // eslint-disable-next-line
  }, [authState.token, authState.user, fetchUserData, logout]);

  // Completar primer login
  const completeFirstLogin = useCallback(() => {
    localStorage.setItem('firstLogin', 'false');
    setAuthState(prev => ({
      ...prev,
      firstLogin: false
    }));
  }, []);

  // Validar si tiene un rol
  const hasRole = useCallback((roleId) => {
    return authState.user?.atr_id_rol === roleId;
  }, [authState.user]);

  // Actualizar el usuario en contexto
  const updateUser = useCallback((userData) => {
    setAuthState(prev => ({
      ...prev,
      user: userData
    }));
  }, []);

  // Verificar autenticación activa
  const verifyAuthentication = useCallback(async () => {
    if (!authState.token) return false;
    try {
      const response = await axios.get('/api/auth/verify-token');
      return response.data.valid;
    } catch (error) {
      console.error('Active verification failed:', error);
      return false;
    }
  }, [authState.token]);

  // ======= HELPER para consultar permisos =======
  const hasPermission = useCallback((objeto, accion) => {
    // Busca el permiso del objeto correspondiente
    const permiso = authState.permisos?.find(
      p => (p.objeto || p.atr_objeto || p.atr_nombre_objeto) === objeto
    );
    if (!permiso) return false;
    // Lee el valor esperado ('SI', '1', true)
    const mapCampo = {
      CONSULTAR: permiso.consultar ?? permiso.atr_permiso_consultar,
      INSERTAR: permiso.insertar ?? permiso.atr_permiso_insercion,
      ACTUALIZAR: permiso.actualizar ?? permiso.atr_permiso_actualizacion,
      ELIMINAR: permiso.eliminar ?? permiso.atr_permiso_eliminacion
    };
    const value = mapCampo[accion];
    return value === 'SI' || value === 1 || value === '1' || value === true;
  }, [authState.permisos]);

  // Context value
  const contextValue = useMemo(() => ({
    user: authState.user,
    token: authState.token,
    permisos: authState.permisos,
    isAuthenticated: () => authState.isAuthenticated,
    isLoading: authState.isLoading,
    firstLogin: authState.firstLogin,
    login,
    logout,
    completeFirstLogin,
    hasRole,
    updateUser,
    verifyAuthentication,
    hasPermission
  }), [
    authState.user,
    authState.token,
    authState.permisos,
    authState.isAuthenticated,
    authState.isLoading,
    authState.firstLogin,
    login,
    logout,
    completeFirstLogin,
    hasRole,
    updateUser,
    verifyAuthentication,
    hasPermission
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {!authState.isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
