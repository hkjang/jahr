'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar,
  Building2,
  Search,
  ArrowRight
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

export default function CareersPage() {
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPostings();
  }, []);

  const fetchPostings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/job-postings?status=PUBLISHED');
      if (response.ok) {
        const data = await response.json();
        setPostings(data);
      }
    } catch (error) {
      console.error('Failed to fetch postings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPostings = postings.filter(posting =>
    posting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    posting.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            함께 성장할 인재를 찾습니다
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            우리와 함께 미래를 만들어갈 열정적인 분들을 기다립니다.
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="관심 있는 포지션을 검색하세요..."
                className="pl-12 h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">
            채용 공고 
            <span className="text-blue-400 ml-2">{filteredPostings.length}건</span>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">로딩 중...</div>
        ) : filteredPostings.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="text-center py-12 text-gray-400">
              현재 진행 중인 채용 공고가 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPostings.map(posting => (
              <Card 
                key={posting.id} 
                className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/10"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge className="bg-blue-600">{employmentTypeLabels[posting.employmentType]}</Badge>
                    {posting.closingDate && (
                      <span className="text-xs text-gray-400">
                        ~{new Date(posting.closingDate).toLocaleDateString('ko-KR')}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-white mt-3">{posting.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400 text-sm line-clamp-3">
                    {posting.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    {posting.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{posting.location}</span>
                      </div>
                    )}
                    {posting.salaryRange && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>{posting.salaryRange}</span>
                      </div>
                    )}
                  </div>
                  
                  <Link href={`/careers/${posting.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      자세히 보기
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2025 JaHR. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
