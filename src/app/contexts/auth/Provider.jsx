import { useEffect, useReducer } from "react";
import isObject from "lodash/isObject";
import PropTypes from "prop-types";
import isString from "lodash/isString";

import axios from "utils/axios";
import { JWT_HOST_API } from "../../../configs/auth.config";
import { isTokenValid, setSession } from "utils/jwt";
import { AuthContext } from "./context";

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,
  user: null,
};

const reducerHandlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  },

  LOGIN_REQUEST: (state) => ({
    ...state,
    isLoading: true,
  }),

  LOGIN_SUCCESS: (state, action) => {
    const { user } = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      isLoading: false,
      user,
    };
  },

  LOGIN_ERROR: (state, action) => {
    const { errorMessage } = action.payload;
    return {
      ...state,
      errorMessage,
      isLoading: false,
    };
  },

  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    isInitialized: true,
    user: null,
    errorMessage: null,
  }),
};

const reducer = (state, action) => {
  const handler = reducerHandlers[action.type];
  return handler ? handler(state, action) : state;
};

// Fonction utilitaire pour obtenir la route par défaut selon le rôle
const getDefaultRouteForRole = (role) => {
  const normalizedRole = role?.toLowerCase();
  switch(normalizedRole) {
    case 'fournisseur':
      return '/expediteur/tableau-de-bord';
    case 'chef_agence':
      return '/agence/tableau-de-bord';
    case 'admin':
      return '/admin/tableau-de-bord';
    default:
      return '/';
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("authUser");

        console.log("authToken:", authToken);
        console.log("storedUser:", storedUser);

        if (authToken && isTokenValid(authToken) && storedUser) {
          setSession(authToken);
          const user = JSON.parse(storedUser);
          //console.log("Parsed user:", user);
          console.log("User role:", user?.role);

          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: true,
              user,
            },
          });
        } else {
          console.log("No valid token or user found");
          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error("Initialization error:", err);
        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    init();
  }, []);

  const login = async ({ login, pwd }) => {
    dispatch({ type: "LOGIN_REQUEST" });

    try {
      const response = await axios.post(`${JWT_HOST_API}/api/auth/login`, {
        login,
        pwd,
      });

      const { token, user } = response.data;
      //console.log("API response:", response.data);
      //console.log("User role from API:", user?.role);

      if (!isString(token) || !isObject(user)) {
        throw new Error("Format de réponse invalide");
      }

      setSession(token);
      localStorage.setItem("authUser", JSON.stringify(user));
      localStorage.setItem("authToken", token);
      

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user,
        },
      });

      const defaultRoute = getDefaultRouteForRole(user.role);
      window.location.href = defaultRoute;

    } catch (err) {
      console.error("Erreur de connexion:", err);
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage: "Échec de la connexion. Vérifiez vos identifiants.",
        },
      });
    }
  };

  const logout = async () => {
    setSession(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    
    dispatch({ type: "LOGOUT" });
    window.location.href = '/se-connecter';
  };

  if (!children) return null;

  return (
    <AuthContext
      value={{
        ...state,
        login,
        logout,
        getDefaultRouteForRole, 
      }}
    >
      {children}
    </AuthContext>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};