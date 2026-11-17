
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import axios from "axios";

import { makeStore, type AppStore } from "@/lib/store";
import { restoreSession, type AuthUser } from "@/features/auth/authSlice";
import api from "@/services/api";

export function Providers({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<AppStore | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initializeStore() {
      const newStore = makeStore();
      const token = localStorage.getItem("facilitybook_token");

      if (token) {
        try {
          const response = await api.get<AuthUser>("/auth/me");
          const user = response.data;

          if (user.active) {
            newStore.dispatch(restoreSession({ user, token }));
            localStorage.setItem("facilitybook_user", JSON.stringify(user));
          } else {
            localStorage.removeItem("facilitybook_token");
            localStorage.removeItem("facilitybook_user");
          }
        } catch (error: unknown) {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            localStorage.removeItem("facilitybook_token");
            localStorage.removeItem("facilitybook_user");
          } else if (axios.isAxiosError(error)) {
            console.error("Could not verify the saved FacilityBook session.", error);
          } else {
            throw error;
          }
        }
      } else {
        localStorage.removeItem("facilitybook_user");
      }

      if (!cancelled) {
        setStore(newStore);
      }
    }

    void initializeStore();

    return () => {
      cancelled = true;
    };
  }, []);

  // Wait until the Redux store is initialized in the browser.
  if (!store) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        aria-busy="true"
      >
        <p className="text-sm text-muted-foreground">
          Loading FacilityBook...
        </p>
      </div>
    );
  }

  return <Provider store={store}>{children}</Provider>;
}
