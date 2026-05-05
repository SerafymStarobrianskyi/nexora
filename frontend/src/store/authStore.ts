import { create } from "zustand";
import { getProfile, loginUser } from "../api/auth";
import { getToken, removeToken, saveToken } from "../lib/auth-token";

type User = {
  id: string;
  full_name: string;
  email: string;
  created_at?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type AuthStore = {
  user: User | null;
  token: string | null;
  isAuth: boolean;
  isLoading: boolean;

  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  initAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: getToken(),
  isAuth: !!getToken(),
  isLoading: false,

  login: async (payload) => {
    set({ isLoading: true });

    try {
      const data = await loginUser(payload);
      saveToken(data.token);

      set({
        token: data.token,
        isAuth: true,
      });

      await get().fetchProfile();
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    removeToken();

    set({
      user: null,
      token: null,
      isAuth: false,
    });
  },

  fetchProfile: async () => {
    try {
      const data = await getProfile();

      set({
        user: data.user,
        isAuth: true,
      });
    } catch (error) {
      removeToken();

      set({
        user: null,
        token: null,
        isAuth: false,
      });

      throw error;
    }
  },

  initAuth: async () => {
    const token = getToken();

    if (!token) {
      set({
        user: null,
        token: null,
        isAuth: false,
      });
      return;
    }

    set({
      token,
      isAuth: true,
      isLoading: true,
    });

    try {
      await get().fetchProfile();
    } finally {
      set({ isLoading: false });
    }
  },
}));
