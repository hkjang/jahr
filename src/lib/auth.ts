import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);

          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              roles: {
                include: {
                  role: {
                    include: {
                      permissions: {
                        include: {
                          permission: true,
                        },
                      },
                    },
                  },
                },
              },
              employee: {
                include: {
                  organization: true,
                  position: true,
                },
              },
            },
          });

          if (!user) {
            return null;
          }

          if (user.status !== "ACTIVE") {
            throw new Error("비활성화된 계정입니다.");
          }

          const isValidPassword = await compare(password, user.password);

          if (!isValidPassword) {
            return null;
          }

          // 권한 목록 추출
          const permissions = user.roles.flatMap((ur) =>
            ur.role.permissions.map((rp) => rp.permission.code)
          );

          // 역할 목록 추출
          const roles = user.roles.map((ur) => ur.role.code);

          return {
            id: user.id,
            employeeId: user.employeeId,
            email: user.email,
            name: user.name,
            image: user.profileImage,
            roles,
            permissions,
            organizationId: user.employee?.organizationId,
            organizationName: user.employee?.organization.name,
            positionId: user.employee?.positionId,
            positionName: user.employee?.position.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.employeeId = user.employeeId;
        token.roles = user.roles;
        token.permissions = user.permissions;
        token.organizationId = user.organizationId;
        token.organizationName = user.organizationName;
        token.positionId = user.positionId;
        token.positionName = user.positionName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.employeeId = token.employeeId as string;
        session.user.roles = token.roles as string[];
        session.user.permissions = token.permissions as string[];
        session.user.organizationId = token.organizationId as string | undefined;
        session.user.organizationName = token.organizationName as string | undefined;
        session.user.positionId = token.positionId as string | undefined;
        session.user.positionName = token.positionName as string | undefined;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
});
