export { default as authStore } from "./stores/authStore";
export { authActions } from "./actions/authActions";
export { courseActions } from "./actions/courseActions"; // ➕ agregar esta línea
export type { User, LoginCredentials } from "./actions/authActions";
export type { AuthState } from "./stores/authStore";
