"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCandidateExperience } from "../api/drafts-api";

export function useCandidateExperienceQuery() {
  return useQuery({
    queryKey: ["candidate", "experience"],
    queryFn: fetchCandidateExperience,
  });
}
