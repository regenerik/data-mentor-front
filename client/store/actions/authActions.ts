import dispatcher from "../dispatcher";

export const AuthActionTypes = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
} as const;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
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
    dispatcher.dispatch({
      type: AuthActionTypes.LOGOUT,
    });
  },

  // Simulated login function
  login: async (credentials: LoginCredentials) => {
    authActions.loginStart();

    try {
      // Simulate API call with setTimeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate successful login
      const user: User = {
        id: "1",
        email: credentials.email,
        name: "Data Mentor User",
      };

      authActions.loginSuccess(user);
      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      authActions.loginFailure(errorMessage);
      throw error;
    }
  },
};
