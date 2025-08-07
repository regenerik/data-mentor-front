import dispatcher from "../dispatcher";
import { AuthActionTypes } from "../constants/authConstants";


export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  token: string;
  admin?: boolean;
  dni?: string;
  url_image?: string;
}

export const authActions = {
  loginStart: () => {
    dispatcher.dispatch({
      type: AuthActionTypes.LOGIN_START,
    });
  },

  loginSuccess: (user: User) => {
    dispatcher.dispatch({
      type: AuthActionTypes.LOGIN_SUCCESS,
      payload: { user },
    });
  },

  loginFailure: (error: string) => {
    dispatcher.dispatch({
      type: AuthActionTypes.LOGIN_FAILURE,
      payload: { error },
    });
  },

  logout: () => {
    localStorage.clear();
    dispatcher.dispatch({
      type: AuthActionTypes.LOGOUT,
    });
  },

  // 🔥 Login real
  login: async (credentials: LoginCredentials) => {
    authActions.loginStart();

    try {
      const response = await fetch("https://repomatic-turbo-meww.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!data.access_token) {
        throw new Error("Credenciales inválidas");
      }

      const user: User = {
        id: data.dni || "unknown",
        email: data.email,
        name: data.name,
        token: data.access_token,
        admin: data.admin,
        dni: data.dni,
        url_image: data.url_image,
      };

      // Guardar en localStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("name", data.name);
      localStorage.setItem("email", data.email);
      localStorage.setItem("admin", JSON.stringify(data.admin));
      localStorage.setItem("dni", data.dni);
      localStorage.setItem("url_image", data.url_image);

      authActions.loginSuccess(user);
      return user;
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Login fallido";
      authActions.loginFailure(errorMessage);
      throw error;
    }
  },
};