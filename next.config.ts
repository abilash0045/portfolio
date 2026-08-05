import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pins the workspace root to this repo. Without it, Turbopack walks up and
  // finds an unrelated package-lock.json in the home directory and guesses wrong.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
