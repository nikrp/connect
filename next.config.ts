import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const supabaseProjectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = (() => {
  if (!supabaseProjectUrl) return undefined;
  try {
    return new URL(supabaseProjectUrl).hostname;
  } catch (error) {
    console.warn("Invalid NEXT_PUBLIC_SUPABASE_URL", error);
    return undefined;
  }
})();

const remotePatterns: RemotePattern[] = supabaseHostname
  ? [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/**",
      },
    ]
  : [];

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
