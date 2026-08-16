import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth.api';
import { clearStoredAuth, getStoredAuth, saveStoredAuth } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const persistedAuth = getStoredAuth();
    if (persistedAuth) {
      setAuth((current) => current || persistedAuth);
    }
    setLoading(false);
  }, []);

  const persistAuth = useCallback((nextAuth) => {
    if (!nextAuth) {
      setAuth(null);
      clearStoredAuth();
      return;
    }

    setAuth(nextAuth);
    saveStoredAuth(nextAuth);
  }, []);

  const login = useCallback(async (payload) => {
    const response = await authApi.login(payload);
    const platformRole = response.data.user?.platformRole || 'user';
    const effectiveRole = platformRole === 'platform_admin' ? 'platform_admin' : (response.data.primaryOrganizationRole || 'member');
    const nextAuth = {
      user: response.data.user,
      organizations: response.data.organizations || [],
      primaryOrganizationId: response.data.primaryOrganizationId,
      primaryOrganizationRole: response.data.primaryOrganizationRole,
      // For backward compatibility
      organization: {
        id: response.data.primaryOrganizationId,
        name: response.data.organizations?.[0]?.name || 'Current Organization',
      },
      role: effectiveRole,
      accessToken: response.data.accessToken || response.data.token,
      refreshToken: response.data.refreshToken,
      isAuthenticated: true,
    };
    persistAuth(nextAuth);
    return response;
  }, [persistAuth]);

  const register = useCallback(async (payload) => {
    const response = await authApi.register(payload);
    const platformRole = response.data.user?.platformRole || 'user';
    const effectiveRole = platformRole === 'platform_admin' ? 'platform_admin' : (response.data.primaryOrganizationRole || 'org_admin');
    const nextAuth = {
      user: response.data.user,
      organizations: response.data.organizations || [],
      primaryOrganizationId: response.data.primaryOrganizationId,
      primaryOrganizationRole: response.data.primaryOrganizationRole,
      // For backward compatibility
      organization: response.data.organization || {
        id: response.data.primaryOrganizationId,
        name: 'Current Organization',
      },
      role: effectiveRole,
      accessToken: response.data.accessToken || response.data.token,
      refreshToken: response.data.refreshToken,
      isAuthenticated: true,
    };
    persistAuth(nextAuth);
    return response;
  }, [persistAuth]);

  const logout = useCallback(async () => {
    const refreshToken = auth?.refreshToken;
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Ignore logout API failures so the local session can still be cleared.
      }
    }
    persistAuth(null);
  }, [auth, persistAuth]);

  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll();
    } catch {
      // Ignore backend session termination errors and clear local state.
    }
    persistAuth(null);
  }, [persistAuth]);

  const refreshSession = useCallback(async () => {
    const currentAuth = getStoredAuth();
    if (!currentAuth?.refreshToken) {
      persistAuth(null);
      return false;
    }

    try {
      const response = await authApi.refresh(currentAuth.refreshToken);
      const nextAuth = {
        ...currentAuth,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken || currentAuth.refreshToken,
        role: response.data.role || currentAuth.role,
        organization: currentAuth.organization || {
          id: response.data.organizationId,
          name: 'Current Organization',
        },
      };
      persistAuth(nextAuth);
      return true;
    } catch {
      persistAuth(null);
      return false;
    }
  }, [persistAuth]);

  const value = useMemo(() => {
    const platformRole = auth?.user?.platformRole || null;
    const orgRole = auth?.primaryOrganizationRole || null;
    
    // Determine dashboard type based on role hierarchy
    let dashboardType = null;
    if (platformRole === 'platform_admin') {
      dashboardType = 'platform';
    } else if (orgRole === 'org_admin') {
      dashboardType = 'org_admin';
    } else if (auth?.isAuthenticated) {
      dashboardType = 'member';
    }

    return {
      user: auth?.user || null,
      organization: auth?.organization || null,
      organizations: auth?.organizations || [],
      primaryOrganizationId: auth?.primaryOrganizationId || null,
      primaryOrganizationRole: auth?.primaryOrganizationRole || null,
      role: auth?.role || null,
      platformRole,
      dashboardType,
      accessToken: auth?.accessToken || null,
      isAuthenticated: Boolean(auth?.accessToken),
      loading,
      login,
      register,
      logout,
      logoutAll,
      refreshSession,
    };
  }, [auth, loading, login, register, logout, logoutAll, refreshSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
