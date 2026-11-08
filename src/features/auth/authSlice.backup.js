import { createSlice } from "@reduxjs/toolkit";

const savedUser = (() => {
try {
const savedSession = localStorage.getItem("agriflow-session");
return savedSession ? JSON.parse(savedSession) : null;
} catch {
return null;
}
})();

const initialState = {
user: savedUser,
isAuthenticated: Boolean(savedUser),
};

const authSlice = createSlice({
name: "auth",
initialState,
reducers: {
login: (state, action) => {
state.user = action.payload;
state.isAuthenticated = true;
},

logout: (state) => {
  state.user = null;
  state.isAuthenticated = false;
},

},
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
