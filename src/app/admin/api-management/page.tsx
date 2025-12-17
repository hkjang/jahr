'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Key, 
  Plus,
  Webhook,
  Link2,
  Copy,
  Trash2,
  Edit,
  Power
} from 'lucide-react';

interface ApiClient {
  id: string;
  name: string;
  clientId: string;
  clientSecret?: string;
  description: string | null;
  allowedScopes: string[];
  isActive: boolean;
  rateLimitPerMin: number;
  createdAt: string;
  _count: { logs: number };
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string | null;
  isActive: boolean;
  lastTriggered: string | null;
  failureCount: number;
}

interface Integration {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
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

  // Dialog states
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false);
  const [newClientSecret, setNewClientSecret] = useState<string | null>(null);
  
  // Form states
  const [clientForm, setClientForm] = useState({ name: '', description: '', scopes: 'read', rateLimit: '60' });
  const [webhookForm, setWebhookForm] = useState({ name: '', url: '', events: '', secret: '' });
  const [integrationForm, setIntegrationForm] = useState({ name: '', type: 'ERP', apiKey: '', endpoint: '' });

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

  // API Client CRUD
  const handleCreateClient = async () => {
    try {
      const res = await fetch('/api/api-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientForm.name,
          description: clientForm.description,
          allowedScopes: clientForm.scopes.split(',').map(s => s.trim()),
          rateLimitPerMin: parseInt(clientForm.rateLimit),
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setNewClientSecret(data.clientSecret);
        setClientForm({ name: '', description: '', scopes: 'read', rateLimit: '60' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  const handleToggleClient = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/api-clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to toggle client:', error);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/api-clients/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  // Webhook CRUD
  const handleCreateWebhook = async () => {
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: webhookForm.name,
          url: webhookForm.url,
          events: webhookForm.events.split(',').map(s => s.trim()),
          secret: webhookForm.secret || null,
        }),
      });
      
      if (res.ok) {
        setWebhookDialogOpen(false);
        setWebhookForm({ name: '', url: '', events: '', secret: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  const handleToggleWebhook = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/webhooks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to toggle webhook:', error);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/webhooks/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  // Integration CRUD
  const handleCreateIntegration = async () => {
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: integrationForm.name,
          type: integrationForm.type,
          config: { apiKey: integrationForm.apiKey, endpoint: integrationForm.endpoint },
        }),
      });
      
      if (res.ok) {
        setIntegrationDialogOpen(false);
        setIntegrationForm({ name: '', type: 'ERP', apiKey: '', endpoint: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create integration:', error);
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/integrations/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete integration:', error);
    }
  };

  const stats = {
    clients: clients.length,
    activeClients: clients.filter(c => c.isActive).length,
    webhooks: webhooks.length,
    integrations: integrations.length,
  };

  return (
    <div className="space-y-6">
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
            <Button onClick={() => setClientDialogOpen(true)}>
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
                      {client.description && <p className="text-sm text-muted-foreground">{client.description}</p>}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{client.clientId}</span>
                        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(client.clientId)}>
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
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" onClick={() => handleToggleClient(client.id, client.isActive)}>
                        <Power className={`h-4 w-4 ${client.isActive ? 'text-green-500' : 'text-gray-400'}`} />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleDeleteClient(client.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setWebhookDialogOpen(true)}>
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
                          <Badge className="bg-red-100 text-red-800">실패 {webhook.failureCount}회</Badge>
                        )}
                      </div>
                      <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{webhook.url}</p>
                      <div className="flex gap-2">
                        {webhook.events.map((event, i) => (
                          <Badge key={i} variant="outline">{event}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" onClick={() => handleToggleWebhook(webhook.id, webhook.isActive)}>
                        <Power className={`h-4 w-4 ${webhook.isActive ? 'text-green-500' : 'text-gray-400'}`} />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleDeleteWebhook(webhook.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <Button onClick={() => setIntegrationDialogOpen(true)}>
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
                      {integration.syncStatus && <Badge variant="outline">{integration.syncStatus}</Badge>}
                      <Button size="icon" variant="outline" onClick={() => handleDeleteIntegration(integration.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Client Dialog */}
      <Dialog open={clientDialogOpen} onOpenChange={(open) => { setClientDialogOpen(open); if (!open) setNewClientSecret(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newClientSecret ? '클라이언트 생성 완료' : 'API 클라이언트 추가'}</DialogTitle>
            <DialogDescription>
              {newClientSecret ? '아래 시크릿을 안전하게 보관하세요. 다시 확인할 수 없습니다.' : 'OAuth2 API 클라이언트를 생성합니다.'}
            </DialogDescription>
          </DialogHeader>
          
          {newClientSecret ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Client Secret</Label>
                <div className="flex items-center gap-2">
                  <Input value={newClientSecret} readOnly className="font-mono text-sm" />
                  <Button size="icon" variant="outline" onClick={() => copyToClipboard(newClientSecret)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => { setClientDialogOpen(false); setNewClientSecret(null); }}>확인</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>이름</Label>
                  <Input value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} placeholder="클라이언트 이름" />
                </div>
                <div className="space-y-2">
                  <Label>설명</Label>
                  <Input value={clientForm.description} onChange={(e) => setClientForm({ ...clientForm, description: e.target.value })} placeholder="클라이언트 설명" />
                </div>
                <div className="space-y-2">
                  <Label>허용 스코프 (쉼표 구분)</Label>
                  <Input value={clientForm.scopes} onChange={(e) => setClientForm({ ...clientForm, scopes: e.target.value })} placeholder="read, write" />
                </div>
                <div className="space-y-2">
                  <Label>Rate Limit (분당 요청 수)</Label>
                  <Input type="number" value={clientForm.rateLimit} onChange={(e) => setClientForm({ ...clientForm, rateLimit: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setClientDialogOpen(false)}>취소</Button>
                <Button onClick={handleCreateClient}>생성</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webhook 추가</DialogTitle>
            <DialogDescription>이벤트 알림을 받을 Webhook을 등록합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>이름</Label>
              <Input value={webhookForm.name} onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })} placeholder="Webhook 이름" />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={webhookForm.url} onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })} placeholder="https://example.com/webhook" />
            </div>
            <div className="space-y-2">
              <Label>이벤트 (쉼표 구분)</Label>
              <Input value={webhookForm.events} onChange={(e) => setWebhookForm({ ...webhookForm, events: e.target.value })} placeholder="employee.created, leave.approved" />
            </div>
            <div className="space-y-2">
              <Label>시크릿 (선택)</Label>
              <Input value={webhookForm.secret} onChange={(e) => setWebhookForm({ ...webhookForm, secret: e.target.value })} placeholder="검증용 시크릿" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWebhookDialogOpen(false)}>취소</Button>
            <Button onClick={handleCreateWebhook}>등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Integration Dialog */}
      <Dialog open={integrationDialogOpen} onOpenChange={setIntegrationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>외부 연동 추가</DialogTitle>
            <DialogDescription>ERP, 그룹웨어 등 외부 시스템과 연동합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>이름</Label>
              <Input value={integrationForm.name} onChange={(e) => setIntegrationForm({ ...integrationForm, name: e.target.value })} placeholder="연동 이름" />
            </div>
            <div className="space-y-2">
              <Label>타입</Label>
              <select className="w-full border rounded-md p-2" value={integrationForm.type} onChange={(e) => setIntegrationForm({ ...integrationForm, type: e.target.value })}>
                <option value="ERP">ERP</option>
                <option value="GROUPWARE">그룹웨어</option>
                <option value="SLACK">Slack</option>
                <option value="TEAMS">Teams</option>
                <option value="OTHER">기타</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>API 엔드포인트</Label>
              <Input value={integrationForm.endpoint} onChange={(e) => setIntegrationForm({ ...integrationForm, endpoint: e.target.value })} placeholder="https://api.example.com" />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input value={integrationForm.apiKey} onChange={(e) => setIntegrationForm({ ...integrationForm, apiKey: e.target.value })} placeholder="API Key" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIntegrationDialogOpen(false)}>취소</Button>
            <Button onClick={handleCreateIntegration}>연동</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
