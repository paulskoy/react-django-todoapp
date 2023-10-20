import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLogin: false,
  username: "",
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    updateIsLogin: (state, action) => {
      state.isLogin = action.payload;
    },

    updateUsername: (state, action) => {
      state.username = action.payload;
    },
  },
});

export const { updateIsLogin, updateUsername } = loginSlice.actions;
export default loginSlice.reducer;
