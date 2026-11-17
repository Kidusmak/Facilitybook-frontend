import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserRole =
  | "ADMIN"
  | "EMPLOYEE"
  | "FACILITY_MANAGER"
  | "DEPARTMENT_MANAGER"
  | "RESOURCE_OPERATOR";

export type UserStatus = "Active" | "Inactive";

export interface FacilityUser {
  id: number;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  status: UserStatus;
}

interface UsersState {
  items: FacilityUser[];
}

const initialState: UsersState = {
  items: [],
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<FacilityUser[]>) => {
      state.items = action.payload;
    },

    addUser: (state, action: PayloadAction<FacilityUser>) => {
      state.items.unshift(action.payload);
    },

    updateUser: (state, action: PayloadAction<FacilityUser>) => {
      const index = state.items.findIndex(
        (user) => user.id === action.payload.id
      );

      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },

    removeUser: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (user) => user.id !== action.payload
      );
    },
  },
});

export const {
  setUsers,
  addUser,
  updateUser,
  removeUser,
} = userSlice.actions;

export default userSlice.reducer;
