import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * 사보험 관리 API
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");

        const insurances = await prisma.privateInsurance.findMany({
            where: {
                isActive: true,
                ...(type && { type }),
            },
            orderBy: { endDate: "asc" },
        });

        // 만료 예정 보험 확인
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringSoon = insurances.filter(
            (ins) => new Date(ins.endDate) <= thirtyDaysFromNow
        );

        return NextResponse.json({
            success: true,
            data: {
                insurances,
                expiringSoon,
                summary: {
                    total: insurances.length,
                    expiringSoonCount: expiringSoon.length,
                    totalPremium: insurances.reduce(
                        (sum, ins) => sum + Number(ins.annualPremium),
                        0
                    ),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching private insurance:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch insurance" },
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

        const insurance = await prisma.privateInsurance.create({
            data: {
                type: body.type,
                name: body.name,
                insuranceCompany: body.insuranceCompany,
                policyNumber: body.policyNumber,
                coverage: body.coverage,
                annualPremium: body.annualPremium,
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
                autoRenewal: body.autoRenewal || false,
                contactPerson: body.contactPerson,
                contactPhone: body.contactPhone,
                notes: body.notes,
            },
        });

        return NextResponse.json({ success: true, data: insurance }, { status: 201 });
    } catch (error) {
        console.error("Error creating private insurance:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create insurance" },
            { status: 500 }
        );
    }
}
