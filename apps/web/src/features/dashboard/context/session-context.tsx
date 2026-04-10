"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UserDTO } from "@trustlink/shared";

const SessionContext = createContext<UserDTO | null>(null);

export function DashboardSessionProvider({
  user,
  children,
}: {
  user: UserDTO;
  children: ReactNode;
}) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export function useDashboardSession(): UserDTO {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useDashboardSession must be used within DashboardSessionProvider");
  }
  return ctx;
}
