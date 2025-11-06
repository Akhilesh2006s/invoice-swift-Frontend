import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Store, 
  Plus, 
  Settings, 
  Eye, 
  Share2, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Globe,
  Palette,
  CreditCard,
  Bell,
  BarChart3
} from 'lucide-react';

interface StoreData {
  _id: string;
  storeName: string;
  storeSlug: string;
  storeDescription: string;
  isPublished: boolean;
  isActive: boolean;
  subscription: {
    plan: string;
    isActive: boolean;
    features: Array<{
      name: string;
      enabled: boolean;
      limit: number;
    }>;
  };
  analytics: {
    totalViews: number;
    totalOrders: number;
    totalRevenue: number;
  };
  domain: {
    customDomain?: string;
    swipeDomain: string;
    isCustom: boolean;
  };
}

const OnlineStore: React.FC = () => {
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDomainSettings, setShowDomainSettings] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    companyId: ''
  });
  const [domainData, setDomainData] = useState({
    customDomain: '',
    isCustom: false
  });

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/stores', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const stores = await response.json();
        if (stores.length > 0) {
          setStore(stores[0]);
        }
      }
    } catch (error) {
      setError('Failed to fetch store data');
    } finally {
      setLoading(false);
    }
  };

  const createStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newStore = await response.json();
        setStore(newStore);
        setShowCreateStore(false);
        setFormData({ storeName: '', storeDescription: '', companyId: '' });
      } else {
        const error = await response.json();
        setError(error.message);
      }
    } catch (error) {
      setError('Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  const publishStore = async () => {
    if (!store) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/stores/${store._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: !store.isPublished })
      });

      if (response.ok) {
        const updatedStore = await response.json();
        setStore(updatedStore);
      }
    } catch (error) {
      setError('Failed to update store status');
    }
  };

  const updateDomain = async () => {
    if (!store) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/stores/${store._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          domain: {
            customDomain: domainData.customDomain,
            isCustom: domainData.isCustom,
            swipeDomain: domainData.isCustom ? '' : `${store.storeSlug}.swipe.com`
          }
        })
      });

      if (response.ok) {
        const updatedStore = await response.json();
        setStore(updatedStore);
        setShowDomainSettings(false);
        setDomainData({ customDomain: '', isCustom: false });
      }
    } catch (error) {
      setError('Failed to update domain settings');
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Online Store</h1>
              <p className="mt-2 text-gray-600">Create and manage your online store</p>
            </div>
            {store && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.open(`/store/${store.storeSlug}`, '_blank')}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Store
                </Button>
                <Button variant="outline" onClick={() => setShowSettings(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            )}
          </div>

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!store ? (
            // Create Store Section
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Create Your Online Store
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Store className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">No Store Found</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first online store to start selling your products online.
                  </p>
                  <Button onClick={() => setShowCreateStore(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Store Dashboard
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Store Overview */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      Store Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{store.storeName}</h3>
                          <p className="text-gray-600">{store.storeDescription}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {store.isPublished ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Published
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-orange-600">
                              <AlertCircle className="w-4 h-4" />
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {store.domain.isCustom ? store.domain.customDomain : store.domain.swipeDomain || `${store.storeSlug}.swipe.com`}
                            </span>
                            {store.domain.isCustom && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                Custom Domain
                              </span>
                            )}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(`/store/${store.storeSlug}`, '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Visit Store
                          </Button>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowDomainSettings(true)}>
                          <Settings className="w-4 h-4 mr-1" />
                          Manage Domain
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={publishStore}
                          variant={store.isPublished ? "outline" : "default"}
                        >
                          {store.isPublished ? 'Unpublish' : 'Publish Store'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowSettings(true)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Total Views</span>
                        </div>
                        <span className="font-semibold">{store.analytics.totalViews}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Total Orders</span>
                        </div>
                        <span className="font-semibold">{store.analytics.totalOrders}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">Revenue</span>
                        </div>
                        <span className="font-semibold">{formatAmount(store.analytics.totalRevenue)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Create Store Modal */}
          {showCreateStore && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle>Create Your Store</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createStore} className="space-y-4">
                    <div>
                      <Label htmlFor="storeName">Store Name</Label>
                      <Input
                        id="storeName"
                        value={formData.storeName}
                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                        placeholder="Enter your store name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="storeDescription">Store Description</Label>
                      <Textarea
                        id="storeDescription"
                        value={formData.storeDescription}
                        onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                        placeholder="Describe your store"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Store'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateStore(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Store Settings Modal */}
          {showSettings && store && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Store Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Basic Settings */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Basic Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="storeName">Store Name</Label>
                          <Input
                            id="storeName"
                            value={store.storeName}
                            onChange={(e) => setStore({ ...store, storeName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="storeDescription">Store Description</Label>
                          <Textarea
                            id="storeDescription"
                            value={store.storeDescription}
                            onChange={(e) => setStore({ ...store, storeDescription: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Layout Settings */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Layout Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Product Layout</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select layout" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="grid">Grid</SelectItem>
                              <SelectItem value="list">List</SelectItem>
                              <SelectItem value="masonry">Masonry</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Payment Settings */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="cod" defaultChecked />
                          <Label htmlFor="cod">Cash on Delivery</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="online" defaultChecked />
                          <Label htmlFor="online">Online Payment</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button>Save Settings</Button>
                      <Button variant="outline" onClick={() => setShowSettings(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Domain Management Modal */}
          {showDomainSettings && store && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Domain Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current Domain Status */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Current Domain</h4>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {store.domain.isCustom ? store.domain.customDomain : store.domain.swipeDomain || `${store.storeSlug}.swipe.com`}
                        </span>
                        {store.domain.isCustom && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Domain Options */}
                    <div className="space-y-4">
                      <div>
                        <Label>Domain Type</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="swipe-domain" 
                              name="domain-type" 
                              checked={!domainData.isCustom}
                              onChange={() => setDomainData({ ...domainData, isCustom: false, customDomain: '' })}
                            />
                            <Label htmlFor="swipe-domain">Use Swipe Domain (Free)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="custom-domain" 
                              name="domain-type" 
                              checked={domainData.isCustom}
                              onChange={() => setDomainData({ ...domainData, isCustom: true })}
                            />
                            <Label htmlFor="custom-domain">Use Custom Domain (Premium)</Label>
                          </div>
                        </div>
                      </div>

                      {domainData.isCustom && (
                        <div>
                          <Label htmlFor="customDomain">Custom Domain</Label>
                          <Input
                            id="customDomain"
                            placeholder="yourdomain.com"
                            value={domainData.customDomain}
                            onChange={(e) => setDomainData({ ...domainData, customDomain: e.target.value })}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter your domain without http:// or https://
                          </p>
                        </div>
                      )}

                      {!domainData.isCustom && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Your Swipe Domain:</strong> {store.storeSlug}.swipe.com
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            This domain is free and ready to use immediately.
                          </p>
                        </div>
                      )}

                      {domainData.isCustom && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Custom Domain Setup Required:</strong>
                          </p>
                          <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                            <li>• Point your domain's A record to our servers</li>
                            <li>• Add CNAME record: www → yourdomain.com</li>
                            <li>• SSL certificate will be automatically provisioned</li>
                            <li>• Domain verification may take 24-48 hours</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={updateDomain} disabled={domainData.isCustom && !domainData.customDomain}>
                        {domainData.isCustom ? 'Update Custom Domain' : 'Use Swipe Domain'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowDomainSettings(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OnlineStore;
