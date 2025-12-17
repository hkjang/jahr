import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - AI-powered mentor matching for new hire
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checklistId, menteeId, preferredMentorId } = body;

    if (!checklistId || !menteeId) {
      return NextResponse.json(
        { error: 'Checklist ID and mentee ID are required' },
        { status: 400 }
      );
    }

    // Check if assignment already exists
    const existing = await prisma.mentorAssignment.findUnique({
      where: { checklistId }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Mentor assignment already exists for this checklist' },
        { status: 400 }
      );
    }

    // Get mentee details
    const mentee = await prisma.employee.findFirst({
      where: { userId: menteeId },
      include: { 
        job: true,
        organization: true,
        position: true
      }
    });

    if (!mentee) {
      return NextResponse.json(
        { error: 'Mentee not found' },
        { status: 404 }
      );
    }

    let selectedMentor = null;
    let matchScore = 0;
    let matchReason = '';

    if (preferredMentorId) {
      // Use preferred mentor if specified
      selectedMentor = await prisma.employee.findFirst({
        where: { userId: preferredMentorId },
        include: { user: true, job: true, position: true }
      });
      matchScore = 80;
      matchReason = 'Manual assignment by HR';
    } else {
      // AI-powered matching: Find best mentor candidate
      // Criteria: Same job/organization, more experience, not already mentoring too many
      
      const potentialMentors = await prisma.employee.findMany({
        where: {
          userId: { not: menteeId },
          organizationId: mentee.organizationId,
          hireDate: { lt: mentee.hireDate }, // Must have more tenure
        },
        include: {
          user: true,
          job: true,
          position: true,
          _count: {
            select: {
              // Count active mentor assignments (approximation via checking all assignments)
            }
          }
        },
        orderBy: { hireDate: 'asc' }, // Prefer more experienced
        take: 10
      });

      if (potentialMentors.length > 0) {
        // Score each potential mentor
        const scoredMentors = potentialMentors.map(mentor => {
          let score = 50; // Base score
          
          // Same job: +20
          if (mentor.jobId === mentee.jobId) score += 20;
          
          // Position level difference (moderate gap is better)
          const positionDiff = (mentor.position?.level || 0) - (mentee.position?.level || 0);
          if (positionDiff >= 1 && positionDiff <= 2) score += 15;
          
          // Years of experience bonus
          const yearsExp = (new Date().getTime() - mentor.hireDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
          if (yearsExp >= 2) score += 10;
          if (yearsExp >= 5) score += 5;

          return { mentor, score };
        });

        // Select highest scoring mentor
        scoredMentors.sort((a, b) => b.score - a.score);
        selectedMentor = scoredMentors[0].mentor;
        matchScore = scoredMentors[0].score;
        
        const reasons: string[] = [];
        if (selectedMentor.jobId === mentee.jobId) reasons.push('Same job function');
        if (selectedMentor.organizationId === mentee.organizationId) reasons.push('Same department');
        const yearsExp = Math.floor((new Date().getTime() - selectedMentor.hireDate.getTime()) / (365 * 24 * 60 * 60 * 1000));
        reasons.push(`${yearsExp} years experience`);
        matchReason = reasons.join(', ');
      }
    }

    if (!selectedMentor) {
      return NextResponse.json(
        { error: 'No suitable mentor found. Please assign manually.' },
        { status: 404 }
      );
    }

    // Create mentor assignment
    const assignment = await prisma.mentorAssignment.create({
      data: {
        checklistId,
        menteeId,
        mentorId: selectedMentor.userId,
        matchScore,
        matchReason,
        startDate: new Date(),
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({
      ...assignment,
      mentor: {
        id: selectedMentor.userId,
        name: selectedMentor.user.name,
        job: selectedMentor.job?.name,
        position: selectedMentor.position?.name
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to match mentor:', error);
    return NextResponse.json(
      { error: 'Failed to match mentor' },
      { status: 500 }
    );
  }
}

// GET - Get mentor assignment for checklist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checklistId = searchParams.get('checklistId');
    const mentorId = searchParams.get('mentorId');
    const menteeId = searchParams.get('menteeId');

    const where: Record<string, unknown> = {};
    if (checklistId) where.checklistId = checklistId;
    if (mentorId) where.mentorId = mentorId;
    if (menteeId) where.menteeId = menteeId;

    const assignments = await prisma.mentorAssignment.findMany({
      where,
      include: {
        feedback: true,
        checklist: {
          select: { employeeId: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Failed to fetch mentor assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentor assignments' },
      { status: 500 }
    );
  }
}
