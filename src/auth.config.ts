import type { NextAuthConfig } from "next-auth";

// Config edge-safe (sem Prisma/bcrypt) usada pelo middleware. O provider
// Credentials completo (com acesso ao banco) só existe em auth.ts, que roda
// em Node runtime nas rotas de API.
export default {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roleName = user.roleName;
        token.permissions = user.permissions;
        token.modulePermissions = user.modulePermissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.roleName = token.roleName as string;
        session.user.permissions = (token.permissions as string[]) ?? [];
        session.user.modulePermissions = (token.modulePermissions as string[]) ?? [];
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
