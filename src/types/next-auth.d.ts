import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    roleName?: string;
    permissions?: string[];
    modulePermissions?: string[];
  }

  interface Session {
    user: {
      id: string;
      roleName: string;
      permissions: string[];
      modulePermissions: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roleName?: string;
    permissions?: string[];
    modulePermissions?: string[];
  }
}
