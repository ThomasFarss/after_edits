import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
                modulePermissions: { include: { modulePermission: { include: { module: true } } } },
              },
            },
          },
        });
        if (!user || user.status !== "ACTIVE") return null;

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roleName: user.role.name,
          permissions: user.role.permissions.map((rp) => rp.permission.key),
          modulePermissions: user.role.modulePermissions.map(
            (rmp) => `${rmp.modulePermission.module.key}:${rmp.modulePermission.action}`
          ),
        };
      },
    }),
  ],
});
