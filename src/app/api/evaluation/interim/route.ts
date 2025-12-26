import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * 중간면담 API
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const review = await prisma.interimReview.create({
            data: {
                goalId: body.goalId,
                reviewDate: new Date(body.reviewDate),
                progress: body.progress,
                achievements: body.achievements,
                challenges: body.challenges,
                planActions: body.planActions,
                reviewerComments: body.reviewerComments,
                reviewerId: body.reviewerId,
            },
            include: {
                goal: {
                    include: {
                        employee: {
                            include: {
                                user: { select: { name: true } },
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json({ success: true, data: review }, { status: 201 });
    } catch (error) {
        console.error("Error creating interim review:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create interim review" },
            { status: 500 }
        );
    }
}
