import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't auto-generate AGENTS.md / CLAUDE.md in the repo.
  agentRules: false,
};

export default nextConfig;
