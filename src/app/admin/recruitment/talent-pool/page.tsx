'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  Search,
  Star,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';

interface Applicant {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  resumeUrl: string | null;
  portfolioUrl: string | null;
  source: string | null;
  isInTalentPool: boolean;
  applications: Array<{
    id: string;
    posting: {
      id: string;
      title: string;
    };
  }>;
  _count: {
    applications: number;
  };
  createdAt: string;
}

export default function TalentPoolPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTalentPool();
  }, []);

  const fetchTalentPool = async () => {
    try {
      setLoading(true);
      const url = searchQuery 
        ? `/api/talent-pool?search=${encodeURIComponent(searchQuery)}`
        : '/api/talent-pool';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setApplicants(data);
      }
    } catch (error) {
      console.error('Failed to fetch talent pool:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTalentPool();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">인재풀</h1>
          <p className="text-muted-foreground">미채용 우수 인재를 관리합니다.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">인재풀 인원</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 지원 이력</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applicants.reduce((sum, a) => sum + a._count.applications, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름 또는 이메일로 검색..."
            className="pl-10"
          />
        </div>
        <Button type="submit">검색</Button>
      </form>

      {/* Talent List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
      ) : applicants.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            인재풀에 등록된 인재가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applicants.map(applicant => (
            <Card key={applicant.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {applicant.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{applicant.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {applicant._count.applications}회 지원
                        </Badge>
                      </div>
                    </div>
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{applicant.email}</span>
                    </div>
                    {applicant.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{applicant.phone}</span>
                      </div>
                    )}
                  </div>

                  {applicant.applications.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">최근 지원</p>
                      {applicant.applications.slice(0, 2).map(app => (
                        <Badge key={app.id} variant="secondary" className="text-xs mr-1">
                          {app.posting.title}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {applicant.resumeUrl && (
                      <Button size="sm" variant="outline" className="flex-1">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        이력서
                      </Button>
                    )}
                    <Button size="sm" className="flex-1">
                      연락하기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
