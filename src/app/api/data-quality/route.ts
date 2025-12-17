import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 데이터 품질 이슈 목록
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get('resolved');
    const issueType = searchParams.get('type');

    const where: {
      isResolved?: boolean;
      issueType?: 'MISSING_DATA' | 'INCONSISTENCY' | 'DUPLICATE' | 'INVALID_FORMAT' | 'POLICY_VIOLATION';
    } = {};
    
    if (resolved !== null) where.isResolved = resolved === 'true';
    if (issueType) where.issueType = issueType as typeof where.issueType;

    const issues = await prisma.dataQualityIssue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

// POST: 데이터 품질 이슈 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issueType, entityType, entityId, fieldName, description, severity } = body;

    if (!issueType || !entityType || !entityId || !fieldName || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const issue = await prisma.dataQualityIssue.create({
      data: {
        issueType,
        entityType,
        entityId,
        fieldName,
        description,
        severity: severity || 'MEDIUM',
      },
    });

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    );
  }
}
