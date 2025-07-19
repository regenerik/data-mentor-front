import { EventEmitter } from "../../lib/EventEmitter";
import dispatcher, { FluxAction } from "../dispatcher";
import { AuthActionTypes } from "../../store/constants/authConstants"
import {  User } from "../actions/authActions";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

class AuthStore extends EventEmitter {
  private state: AuthState = {
    isAuthenticated: !!localStorage.getItem("token"),
    isLoading: false,
    error: null,
    user: localStorage.getItem("token")
      ? {
          id: localStorage.getItem("dni") || "",
          email: localStorage.getItem("email") || "",
          name: localStorage.getItem("name") || "",
          token: localStorage.getItem("token") || "",
          admin: JSON.parse(localStorage.getItem("admin") || "false"),
          url_image: localStorage.getItem("url_image") || "",
        }
      : null,
  };

  getState(): AuthState {
    return { ...this.state };
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  isLoading(): boolean {
    return this.state.isLoading;
  }

  getUser(): User | null {
    return this.state.user;
  }

  getError(): string | null {
    return this.state.error;
  }

  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.emit("change");
  }

  private handleAction(action: FluxAction) {
    switch (action.type) {
      case AuthActionTypes.LOGIN_START:
        this.setState({
          isLoading: true,
          error: null,
        });
        break;

      case AuthActionTypes.LOGIN_SUCCESS:
        this.setState({
          isAuthenticated: true,
          isLoading: false,
          user: action.payload.user,
          error: null,
        });
        break;

      case AuthActionTypes.LOGIN_FAILURE:
        this.setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: action.payload.error,
        });
        break;

      case AuthActionTypes.LOGOUT:
        this.setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null,
        });
        break;

      default:
        break;
    }
  }

  addChangeListener(callback: () => void) {
    this.on("change", callback);
  }

  removeChangeListener(callback: () => void) {
    this.removeListener("change", callback);
  }
}

const authStore = new AuthStore();

// Register with dispatcher
dispatcher.register((action: FluxAction) => {
  authStore["handleAction"](action);
});

export default authStore;
