'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Calendar,
  Building2,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string;
  benefits: string | null;
  salaryRange: string | null;
  employmentType: string;
  location: string | null;
  closingDate: string | null;
  createdAt: string;
}

const employmentTypeLabels: Record<string, string> = {
  REGULAR: '정규직',
  CONTRACT: '계약직',
  INTERN: '인턴',
  PART_TIME: '파트타임',
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [posting, setPosting] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchPosting(params.id as string);
    }
  }, [params.id]);

  const fetchPosting = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/job-postings/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPosting(data);
      } else {
        router.push('/careers');
      }
    } catch (error) {
      console.error('Failed to fetch posting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posting) return;
    
    try {
      setSubmitting(true);
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postingId: posting.id,
          ...formData,
          source: 'careers_portal',
        }),
      });
      
      if (response.ok) {
        setSubmitted(true);
        setShowApplyForm(false);
      } else {
        const error = await response.json();
        alert(error.error || '지원에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to apply:', error);
      alert('지원에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!posting) {
    return null;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">지원이 완료되었습니다!</h2>
            <p className="text-gray-400 mb-6">
              입력하신 이메일로 지원 확인 안내가 발송됩니다.
            </p>
            <Link href="/careers">
              <Button className="w-full">채용 공고로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="container mx-auto px-4">
          <Link 
            href="/careers" 
            className="inline-flex items-center text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            채용 공고 목록
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <Badge className="bg-white/20 mb-3">
                {employmentTypeLabels[posting.employmentType]}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {posting.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-blue-100">
                {posting.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{posting.location}</span>
                  </div>
                )}
                {posting.salaryRange && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{posting.salaryRange}</span>
                  </div>
                )}
                {posting.closingDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>마감: {new Date(posting.closingDate).toLocaleDateString('ko-KR')}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => setShowApplyForm(true)}
            >
              지원하기
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">직무 설명</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-300 whitespace-pre-wrap">
                  {posting.description}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">자격 요건</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-300 whitespace-pre-wrap">
                  {posting.requirements}
                </div>
              </CardContent>
            </Card>
            
            {posting.benefits && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">복리후생</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-300 whitespace-pre-wrap">
                    {posting.benefits}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="bg-slate-800 border-slate-700 sticky top-8">
              <CardContent className="pt-6">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
                  size="lg"
                  onClick={() => setShowApplyForm(true)}
                >
                  지원하기
                </Button>
                <p className="text-center text-sm text-gray-400">
                  입사 지원서를 작성해주세요
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-white">입사 지원</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleApply} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">이름</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">이메일</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">연락처</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="010-0000-0000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">자기소개서</Label>
                  <Textarea
                    value={formData.coverLetter}
                    onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white min-h-[150px]"
                    placeholder="지원 동기와 경험을 자유롭게 작성해주세요."
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowApplyForm(false)}
                  >
                    취소
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      '지원하기'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
