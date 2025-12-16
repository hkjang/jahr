import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    employeeId: string;
    email: string;
    name: string;
    image?: string | null;
    roles: string[];
    permissions: string[];
    organizationId?: string;
    organizationName?: string;
    positionId?: string;
    positionName?: string;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    employeeId: string;
    roles: string[];
    permissions: string[];
    organizationId?: string;
    organizationName?: string;
    positionId?: string;
    positionName?: string;
  }
}
