"use client";

import { useDashboardSession } from "../context/session-context";
import { CandidateDashboard } from "./role-panels/candidate-dashboard";
import { HRDashboard } from "./role-panels/hr-dashboard";
import { RecruiterDashboard } from "./role-panels/recruiter-dashboard";

export function DashboardRoleHome() {
  const user = useDashboardSession();

  switch (user.role) {
    case "CANDIDATE":
      return <CandidateDashboard />;
    case "RECRUITER":
      return <RecruiterDashboard />;
    case "HR":
      return <HRDashboard />;
    default:
      return <CandidateDashboard />;
  }
}
