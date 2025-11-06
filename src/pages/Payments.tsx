import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  DollarSign,
  AlertCircle,
  Eye,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import { PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Payment {
  _id: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  status: string;
  description: string;
  referenceNumber: string;
  customerId: Customer;
  createdAt: string;
}

interface PaymentStats {
  totalReceived: number;
  totalPaid: number;
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
}

const Payments: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<PaymentStats>({
    totalReceived: 0,
    totalPaid: 0,
    totalPayments: 0,
    pendingPayments: 0,
    completedPayments: 0
  });
  const [paymentMethodsData, setPaymentMethodsData] = useState<any[]>([]);
  const [dailyPaymentsData, setDailyPaymentsData] = useState<any[]>([]);

  useEffect(() => {
    fetchPayments();
    fetchCustomers();
    fetchStats();
  }, [searchQuery, customerFilter, statusFilter, paymentTypeFilter, startDate, endDate, currentPage]);

  // Fetch analytics for charts
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/analytics/payments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPaymentMethodsData(data.paymentMethods || []);
          setDailyPaymentsData(data.dailyPayments || []);
        }
      } catch {}
    };
    fetchAnalytics();
  }, []);

  // Live updates via SSE to refresh chart data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const streamUrl = new URL('https://invoice-swift-backend-production.up.railway.app/api/analytics/stream');
    streamUrl.searchParams.set('period', '30days');
    streamUrl.searchParams.set('token', token);
    const es = new EventSource(streamUrl.toString());
    const refresh = async () => {
      try {
        const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/analytics/payments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPaymentMethodsData(data.paymentMethods || []);
          setDailyPaymentsData(data.dailyPayments || []);
        }
      } catch {}
    };
    es.addEventListener('update', refresh as any);
    es.addEventListener('snapshot', refresh as any);
    es.addEventListener('error', () => { try { es.close(); } catch {} });
    return () => { try { es.close(); } catch {} };
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchQuery,
        customerId: customerFilter === 'all' ? '' : customerFilter,
        status: statusFilter === 'all' ? '' : statusFilter,
        paymentType: paymentTypeFilter === 'all' ? '' : paymentTypeFilter,
        startDate,
        endDate
      });

      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/payments?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
        setTotalPages(data.pagination.pages);
      } else {
        setError('Failed to fetch payments');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/payments/stats?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDownloadStatement = async (customerId: string) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/payments/customer/${customerId}/download?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customer-statement-${customerId}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to download statement');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentTypeBadge = (type: string) => {
    return type === 'Received' 
      ? <Badge className="bg-green-100 text-green-800">Received</Badge>
      : <Badge className="bg-red-100 text-red-800">Paid</Badge>;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Charts config
  const CHART_COLORS = ['#000000', '#666666', '#999999', '#CCCCCC', '#333333', '#555555', '#777777', '#AAAAAA'];
  const paymentMethodsConfig: ChartConfig = (paymentMethodsData || []).reduce((acc: any, m: any, idx: number) => {
    acc[m._id] = { label: m._id, color: CHART_COLORS[idx % CHART_COLORS.length] };
    return acc;
  }, {});
  const paymentTrendsConfig: ChartConfig = {
    received: { label: 'Money Received', color: 'hsl(0, 0%, 0%)' },
    paid: { label: 'Money Paid', color: 'hsl(0, 0%, 40%)' },
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payments & Ledgers</h1>
              <p className="mt-2 text-gray-600">Track all payments and customer statements</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export All
              </Button>
              <Button 
                className="flex items-center gap-2"
                onClick={() => navigate('/payments/create')}
              >
                <DollarSign className="w-4 h-4" />
                Add Payment
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Received</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatAmount(stats.totalReceived)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Paid</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatAmount(stats.totalPaid)}
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Payments</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalPayments}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completedPayments}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search payments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  <Select value={customerFilter} onValueChange={setCustomerFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Customers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer._id} value={customer._id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Received">Received</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {(paymentMethodsData || []).length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ChartContainer config={paymentMethodsConfig} className="h-full w-full" style={{ aspectRatio: 'unset' }}>
                      <RechartsPieChart>
                        <Pie data={(paymentMethodsData || []).map((m: any, i: number) => ({ name: m._id, value: m.total, color: CHART_COLORS[i % CHART_COLORS.length] }))} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
                          {(paymentMethodsData || []).map((_: any, i: number) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatAmount(v as number)} />} />
                        <ChartLegend content={<ChartLegendContent />} />
                      </RechartsPieChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">No payment data</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Payment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {(dailyPaymentsData || []).length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ChartContainer config={paymentTrendsConfig} className="h-full w-full" style={{ aspectRatio: 'unset' }}>
                      <LineChart data={dailyPaymentsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                        <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatAmount(v as number)} />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line type="monotone" dataKey="received" stroke="#000000" strokeWidth={2} />
                        <Line type="monotone" dataKey="paid" stroke="#666666" strokeWidth={2} />
                      </LineChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">No daily payments</div>
                )}
              </CardContent>
            </Card>
          </div>

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No payments found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Payment #</th>
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Method</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="font-medium text-blue-600">
                              {payment.paymentNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{payment.customerId.name}</p>
                              <p className="text-sm text-gray-500">{payment.customerId.phone}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-600">
                              {formatDate(payment.paymentDate)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {getPaymentTypeBadge(payment.paymentType)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${
                              payment.paymentType === 'Received' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {payment.paymentType === 'Received' ? '+' : '-'}
                              {formatAmount(payment.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-600">{payment.paymentMethod}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusBadge(payment.status)}>
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDownloadStatement(payment.customerId._id)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
