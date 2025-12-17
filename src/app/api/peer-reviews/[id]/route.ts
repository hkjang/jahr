import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const review = await prisma.peerReview.findUnique({
      where: { id },
      include: {
        cycle: {
          include: {
            questions: {
              include: {
                question: true,
              },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        responses: true,
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.reviewerId !== session.user?.id && !session.user?.roles?.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const questionsWithResponses = review.cycle.questions.map((cq) => {
      const response = review.responses.find((r) => r.questionId === cq.questionId);
      return {
        questionId: cq.question.id,
        category: cq.question.category,
        question: cq.question.question,
        questionType: cq.question.questionType,
        isRequired: cq.question.isRequired,
        sortOrder: cq.sortOrder,
        response: response ? {
          rating: response.rating,
          textResponse: response.textResponse,
        } : null,
      };
    });

    return NextResponse.json({
      id: review.id,
      cycleId: review.cycleId,
      cycleName: review.cycle.name,
      cycleEndDate: review.cycle.endDate,
      revieweeId: review.revieweeId,
      reviewType: review.reviewType,
      status: review.status,
      overallRating: review.overallRating,
      strengths: review.strengths,
      improvements: review.improvements,
      comments: review.comments,
      completedAt: review.completedAt,
      questions: questionsWithResponses,
    });
  } catch (error) {
    console.error('Failed to fetch review:', error);
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
  }
}

interface ReviewResponse {
  questionId: string;
  rating?: number;
  textResponse?: string;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { responses, overallRating, strengths, improvements, comments, submit } = body;

    const existingReview = await prisma.peerReview.findUnique({
      where: { id },
      include: {
        cycle: {
          include: {
            questions: {
              include: { question: true },
            },
          },
        },
      },
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (existingReview.reviewerId !== session.user?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (existingReview.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Review already completed' }, { status: 400 });
    }

    if (responses && Array.isArray(responses)) {
      for (const resp of responses as ReviewResponse[]) {
        await prisma.peerReviewResponse.upsert({
          where: {
            reviewId_questionId: {
              reviewId: id,
              questionId: resp.questionId,
            },
          },
          create: {
            reviewId: id,
            questionId: resp.questionId,
            rating: resp.rating,
            textResponse: resp.textResponse,
          },
          update: {
            rating: resp.rating,
            textResponse: resp.textResponse,
          },
        });
      }
    }

    if (submit) {
      const requiredQuestions = existingReview.cycle.questions
        .filter((q) => q.question.isRequired)
        .map((q) => q.questionId);

      const savedResponses = await prisma.peerReviewResponse.findMany({
        where: { reviewId: id },
      });

      const answeredQuestionIds = savedResponses.map((r) => r.questionId);
      const missingRequired = requiredQuestions.filter((qId) => !answeredQuestionIds.includes(qId));

      if (missingRequired.length > 0) {
        return NextResponse.json(
          { error: 'Please answer all required questions', missingQuestions: missingRequired },
          { status: 400 }
        );
      }
    }

    const review = await prisma.peerReview.update({
      where: { id },
      data: {
        ...(overallRating !== undefined && { overallRating }),
        ...(strengths !== undefined && { strengths }),
        ...(improvements !== undefined && { improvements }),
        ...(comments !== undefined && { comments }),
        status: submit ? 'COMPLETED' : 'IN_PROGRESS',
        ...(submit && { completedAt: new Date() }),
      },
      include: {
        responses: true,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Failed to update review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
