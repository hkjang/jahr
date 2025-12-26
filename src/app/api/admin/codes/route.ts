import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * 시스템 코드 관리 API
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const groupCode = searchParams.get("groupCode");

        const codes = await prisma.systemCode.findMany({
            where: {
                isActive: true,
                ...(groupCode && { groupCode }),
            },
            orderBy: [{ groupCode: "asc" }, { sortOrder: "asc" }],
        });

        // 그룹별로 분류
        const groupedCodes = codes.reduce((acc, code) => {
            if (!acc[code.groupCode]) {
                acc[code.groupCode] = {
                    groupCode: code.groupCode,
                    groupName: code.groupName,
                    codes: [],
                };
            }
            acc[code.groupCode].codes.push(code);
            return acc;
        }, {} as Record<string, any>);

        return NextResponse.json({
            success: true,
            data: Object.values(groupedCodes),
        });
    } catch (error) {
        console.error("Error fetching system codes:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch system codes" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const code = await prisma.systemCode.create({
            data: {
                groupCode: body.groupCode,
                groupName: body.groupName,
                code: body.code,
                name: body.name,
                description: body.description,
                sortOrder: body.sortOrder || 0,
            },
        });

        return NextResponse.json({ success: true, data: code }, { status: 201 });
    } catch (error) {
        console.error("Error creating system code:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create system code" },
            { status: 500 }
        );
    }
}
