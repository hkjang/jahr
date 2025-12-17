import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/jahr?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // 1. 권한 생성
  const permissions = [
    // 직원 관리
    { code: "employee:read:self", name: "본인 정보 조회", module: "employee", action: "read", scope: "self" },
    { code: "employee:read:team", name: "팀원 정보 조회", module: "employee", action: "read", scope: "team" },
    { code: "employee:read:all", name: "전체 직원 조회", module: "employee", action: "read", scope: "all" },
    { code: "employee:write:all", name: "직원 정보 수정", module: "employee", action: "write", scope: "all" },
    // 근태 관리
    { code: "attendance:read:self", name: "본인 근태 조회", module: "attendance", action: "read", scope: "self" },
    { code: "attendance:read:team", name: "팀원 근태 조회", module: "attendance", action: "read", scope: "team" },
    { code: "attendance:read:all", name: "전체 근태 조회", module: "attendance", action: "read", scope: "all" },
    { code: "attendance:write:self", name: "본인 근태 입력", module: "attendance", action: "write", scope: "self" },
    { code: "attendance:approve:team", name: "팀원 근태 승인", module: "attendance", action: "approve", scope: "team" },
    // 휴가 관리
    { code: "leave:read:self", name: "본인 휴가 조회", module: "leave", action: "read", scope: "self" },
    { code: "leave:read:all", name: "전체 휴가 조회", module: "leave", action: "read", scope: "all" },
    { code: "leave:write:self", name: "휴가 신청", module: "leave", action: "write", scope: "self" },
    { code: "leave:approve:team", name: "휴가 승인", module: "leave", action: "approve", scope: "team" },
    // 급여 관리
    { code: "salary:read:self", name: "본인 급여 조회", module: "salary", action: "read", scope: "self" },
    { code: "salary:read:all", name: "전체 급여 조회", module: "salary", action: "read", scope: "all" },
    { code: "salary:write:all", name: "급여 관리", module: "salary", action: "write", scope: "all" },
    // 평가 관리
    { code: "evaluation:read:self", name: "본인 평가 조회", module: "evaluation", action: "read", scope: "self" },
    { code: "evaluation:read:team", name: "팀원 평가 조회", module: "evaluation", action: "read", scope: "team" },
    { code: "evaluation:read:all", name: "전체 평가 조회", module: "evaluation", action: "read", scope: "all" },
    { code: "evaluation:write:self", name: "자기평가 입력", module: "evaluation", action: "write", scope: "self" },
    { code: "evaluation:write:team", name: "팀원 평가 입력", module: "evaluation", action: "write", scope: "team" },
    // 교육 관리
    { code: "training:read:self", name: "본인 교육 조회", module: "training", action: "read", scope: "self" },
    { code: "training:read:all", name: "전체 교육 조회", module: "training", action: "read", scope: "all" },
    { code: "training:write:all", name: "교육 관리", module: "training", action: "write", scope: "all" },
    // 조직 관리
    { code: "organization:read:all", name: "조직 조회", module: "organization", action: "read", scope: "all" },
    { code: "organization:write:all", name: "조직 관리", module: "organization", action: "write", scope: "all" },
    // 결재 관리
    { code: "approval:read:self", name: "본인 결재 조회", module: "approval", action: "read", scope: "self" },
    { code: "approval:read:all", name: "전체 결재 조회", module: "approval", action: "read", scope: "all" },
    { code: "approval:write:self", name: "결재 신청", module: "approval", action: "write", scope: "self" },
    { code: "approval:approve:assigned", name: "결재 승인", module: "approval", action: "approve", scope: "assigned" },
    // 시스템 관리
    { code: "system:read:all", name: "시스템 조회", module: "system", action: "read", scope: "all" },
    { code: "system:write:all", name: "시스템 관리", module: "system", action: "write", scope: "all" },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {},
      create: permission,
    });
  }
  console.log("✅ Permissions created");

  // 2. 역할 생성
  const roles = [
    {
      code: "EMPLOYEE",
      name: "일반 직원",
      description: "일반 직원 권한",
      permissions: [
        "employee:read:self",
        "attendance:read:self",
        "attendance:write:self",
        "leave:read:self",
        "leave:write:self",
        "salary:read:self",
        "evaluation:read:self",
        "evaluation:write:self",
        "training:read:self",
        "organization:read:all",
        "approval:read:self",
        "approval:write:self",
      ],
    },
    {
      code: "TEAM_LEADER",
      name: "팀장",
      description: "팀장 권한",
      permissions: [
        "employee:read:self",
        "employee:read:team",
        "attendance:read:self",
        "attendance:read:team",
        "attendance:write:self",
        "attendance:approve:team",
        "leave:read:self",
        "leave:read:all",
        "leave:write:self",
        "leave:approve:team",
        "salary:read:self",
        "evaluation:read:self",
        "evaluation:read:team",
        "evaluation:write:self",
        "evaluation:write:team",
        "training:read:self",
        "training:read:all",
        "organization:read:all",
        "approval:read:self",
        "approval:write:self",
        "approval:approve:assigned",
      ],
    },
    {
      code: "HR_ADMIN",
      name: "HR 관리자",
      description: "HR 관리자 권한",
      permissions: [
        "employee:read:all",
        "employee:write:all",
        "attendance:read:all",
        "leave:read:all",
        "salary:read:all",
        "salary:write:all",
        "evaluation:read:all",
        "training:read:all",
        "training:write:all",
        "organization:read:all",
        "organization:write:all",
        "approval:read:all",
        "approval:approve:assigned",
      ],
    },
    {
      code: "SYSTEM_ADMIN",
      name: "시스템 관리자",
      description: "시스템 관리자 권한",
      isSystem: true,
      permissions: permissions.map((p) => p.code),
    },
  ];

  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: {
        code: role.code,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem || false,
      },
    });

    // 권한 연결
    for (const permCode of role.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { code: permCode },
      });
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: createdRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: createdRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }
  console.log("✅ Roles created");

  // 3. 직급 생성
  const positions = [
    { code: "EX", name: "임원", level: 1 },
    { code: "GM", name: "부장", level: 2 },
    { code: "MGR", name: "차장", level: 3 },
    { code: "SM", name: "과장", level: 4 },
    { code: "AM", name: "대리", level: 5 },
    { code: "ST", name: "사원", level: 6 },
    { code: "IN", name: "인턴", level: 7 },
  ];

  for (const position of positions) {
    await prisma.position.upsert({
      where: { code: position.code },
      update: {},
      create: position,
    });
  }
  console.log("✅ Positions created");

  // 4. 조직 생성
  const company = await prisma.organization.upsert({
    where: { code: "COMPANY" },
    update: {},
    create: {
      code: "COMPANY",
      name: "JaHR 주식회사",
      level: "COMPANY",
      sortOrder: 1,
    },
  });

  const divisions = [
    { code: "BIZ", name: "경영지원본부" },
    { code: "DEV", name: "개발본부" },
    { code: "SALES", name: "영업본부" },
  ];

  for (const div of divisions) {
    const division = await prisma.organization.upsert({
      where: { code: div.code },
      update: {},
      create: {
        code: div.code,
        name: div.name,
        level: "DIVISION",
        parentId: company.id,
        sortOrder: 1,
      },
    });

    // 하위 팀 생성
    if (div.code === "BIZ") {
      await prisma.organization.upsert({
        where: { code: "HR" },
        update: {},
        create: { code: "HR", name: "인사팀", level: "TEAM", parentId: division.id },
      });
      await prisma.organization.upsert({
        where: { code: "FIN" },
        update: {},
        create: { code: "FIN", name: "재무팀", level: "TEAM", parentId: division.id },
      });
    } else if (div.code === "DEV") {
      await prisma.organization.upsert({
        where: { code: "FE" },
        update: {},
        create: { code: "FE", name: "프론트엔드팀", level: "TEAM", parentId: division.id },
      });
      await prisma.organization.upsert({
        where: { code: "BE" },
        update: {},
        create: { code: "BE", name: "백엔드팀", level: "TEAM", parentId: division.id },
      });
    } else if (div.code === "SALES") {
      await prisma.organization.upsert({
        where: { code: "MKT" },
        update: {},
        create: { code: "MKT", name: "마케팅팀", level: "TEAM", parentId: division.id },
      });
      await prisma.organization.upsert({
        where: { code: "SLS" },
        update: {},
        create: { code: "SLS", name: "영업팀", level: "TEAM", parentId: division.id },
      });
    }
  }
  console.log("✅ Organizations created");

  // 5. 관리자 계정 생성
  const hrTeam = await prisma.organization.findUnique({ where: { code: "HR" } });
  const managerPosition = await prisma.position.findUnique({ where: { code: "MGR" } });
  const adminRole = await prisma.role.findUnique({ where: { code: "SYSTEM_ADMIN" } });
  const hrAdminRole = await prisma.role.findUnique({ where: { code: "HR_ADMIN" } });

  if (hrTeam && managerPosition && adminRole && hrAdminRole) {
    const hashedPassword = await hash("Admin123!", 12);

    const adminUser = await prisma.user.upsert({
      where: { email: "admin@jahr.com" },
      update: {},
      create: {
        employeeId: "EMP24001",
        email: "admin@jahr.com",
        password: hashedPassword,
        name: "시스템 관리자",
        status: "ACTIVE",
      },
    });

    await prisma.employee.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        userId: adminUser.id,
        organizationId: hrTeam.id,
        positionId: managerPosition.id,
        hireDate: new Date("2020-01-01"),
        employmentType: "REGULAR",
        workType: "OFFICE",
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: adminRole.id },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: hrAdminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: hrAdminRole.id },
    });

    console.log("✅ Admin user created (admin@jahr.com / Admin123!)");
  }

  // 6. 테스트 직원 생성
  const feTeam = await prisma.organization.findUnique({ where: { code: "FE" } });
  const staffPosition = await prisma.position.findUnique({ where: { code: "ST" } });
  const employeeRole = await prisma.role.findUnique({ where: { code: "EMPLOYEE" } });

  if (feTeam && staffPosition && employeeRole) {
    const hashedPassword = await hash("Test123!", 12);

    const testUser = await prisma.user.upsert({
      where: { email: "test@jahr.com" },
      update: {},
      create: {
        employeeId: "EMP24002",
        email: "test@jahr.com",
        password: hashedPassword,
        name: "테스트 직원",
        status: "ACTIVE",
      },
    });

    await prisma.employee.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        organizationId: feTeam.id,
        positionId: staffPosition.id,
        hireDate: new Date("2024-01-15"),
        employmentType: "REGULAR",
        workType: "HYBRID",
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: testUser.id, roleId: employeeRole.id } },
      update: {},
      create: { userId: testUser.id, roleId: employeeRole.id },
    });

    // 연차 잔여 생성
    await prisma.leaveBalance.upsert({
      where: {
        employeeId_year_leaveType: {
          employeeId: (await prisma.employee.findUnique({ where: { userId: testUser.id } }))!.id,
          year: 2024,
          leaveType: "ANNUAL",
        },
      },
      update: {},
      create: {
        employeeId: (await prisma.employee.findUnique({ where: { userId: testUser.id } }))!.id,
        year: 2024,
        leaveType: "ANNUAL",
        totalDays: 15,
        usedDays: 0,
      },
    });

    console.log("✅ Test user created (test@jahr.com / Test123!)");
  }

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
