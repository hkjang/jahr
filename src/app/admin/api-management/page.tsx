'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, 
  Plus,
  Webhook,
  Link2,
  Copy,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';

interface ApiClient {
  id: string;
  name: string;
  clientId: string;
  description: string | null;
  allowedScopes: string[];
  isActive: boolean;
  rateLimitPerMin: number;
  createdAt: string;
  _count: {
    logs: number;
  };
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggered: string | null;
  failureCount: number;
}

interface Integration {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  lastSyncAt: string | null;
  syncStatus: string | null;
}

export default function ApiManagementPage() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clients');
  const [showSecret, setShowSecret] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [clientsRes, webhooksRes, integrationsRes] = await Promise.all([
        fetch('/api/api-clients'),
        fetch('/api/webhooks'),
        fetch('/api/integrations'),
      ]);

      if (clientsRes.ok) setClients(await clientsRes.json());
      if (webhooksRes.ok) setWebhooks(await webhooksRes.json());
      if (integrationsRes.ok) setIntegrations(await integrationsRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 통계
  const stats = {
    clients: clients.length,
    activeClients: clients.filter(c => c.isActive).length,
    webhooks: webhooks.length,
    integrations: integrations.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">API 관리</h1>
        <p className="text-muted-foreground">API 클라이언트, Webhook 및 외부 연동을 관리합니다.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API 클라이언트</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clients}</div>
            <p className="text-xs text-muted-foreground">{stats.activeClients}개 활성</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhook</CardTitle>
            <Webhook className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.webhooks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">외부 연동</CardTitle>
            <Link2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.integrations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="clients">API 클라이언트</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook</TabsTrigger>
          <TabsTrigger value="integrations">외부 연동</TabsTrigger>
        </TabsList>

        {/* API Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              클라이언트 추가
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : clients.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                등록된 API 클라이언트가 없습니다.
              </CardContent>
            </Card>
          ) : (
            clients.map(client => (
              <Card key={client.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{client.name}</h3>
                        <Badge className={client.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {client.isActive ? '활성' : '비활성'}
                        </Badge>
                      </div>
                      {client.description && (
                        <p className="text-sm text-muted-foreground">{client.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {client.clientId}
                        </span>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => copyToClipboard(client.clientId)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        {client.allowedScopes.map((scope, i) => (
                          <Badge key={i} variant="outline">{scope}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Rate Limit: {client.rateLimitPerMin}/min | API 호출: {client._count.logs}회
                      </p>
                    </div>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Webhook 추가
            </Button>
          </div>

          {webhooks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                등록된 Webhook이 없습니다.
              </CardContent>
            </Card>
          ) : (
            webhooks.map(webhook => (
              <Card key={webhook.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Webhook className="h-4 w-4 text-purple-500" />
                        <h3 className="font-semibold">{webhook.name}</h3>
                        <Badge className={webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {webhook.isActive ? '활성' : '비활성'}
                        </Badge>
                        {webhook.failureCount > 0 && (
                          <Badge className="bg-red-100 text-red-800">
                            실패 {webhook.failureCount}회
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {webhook.url}
                      </p>
                      <div className="flex gap-2">
                        {webhook.events.map((event, i) => (
                          <Badge key={i} variant="outline">{event}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              연동 추가
            </Button>
          </div>

          {integrations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                등록된 외부 연동이 없습니다.
              </CardContent>
            </Card>
          ) : (
            integrations.map(integration => (
              <Card key={integration.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Link2 className="h-5 w-5 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">{integration.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={integration.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {integration.isActive ? '활성' : '비활성'}
                      </Badge>
                      {integration.syncStatus && (
                        <Badge variant="outline">{integration.syncStatus}</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
