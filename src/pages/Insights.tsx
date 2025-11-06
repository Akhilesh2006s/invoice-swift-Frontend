import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  CreditCard,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  Package,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface FinancialOverview {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  paymentMethods: Array<{
    _id: string;
    total: number;
    count: number;
  }>;
  salesByDate: Array<{
    _id: string;
    total: number;
    count: number;
  }>;
}

interface TopProduct {
  _id: string;
  totalQuantity: number;
  totalAmount: number;
  count: number;
}

interface TopCustomer {
  _id: string;
  totalAmount: number;
  invoiceCount: number;
  avgOrderValue: number;
}

interface PaymentAnalytics {
  paymentFlow: Array<{
    _id: string;
    total: number;
    count: number;
  }>;
  paymentMethods: Array<{
    _id: string;
    total: number;
    count: number;
  }>;
  dailyPayments: Array<{
    _id: string;
    received: number;
    paid: number;
  }>;
}

const Insights: React.FC = () => {
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [paymentAnalytics, setPaymentAnalytics] = useState<PaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchInsights();
  }, [dateRange, startDate, endDate]);

  // Real-time updates via SSE
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const periodMap: { [key: string]: string } = {
      '7': '7days',
      '30': '30days',
      '90': '90days',
      '365': '1year'
    };
    const period = periodMap[dateRange] || '30days';

    // Pass token via query param (SSE cannot send headers)
    const streamUrl = new URL('https://invoice-swift-backend-production.up.railway.app/api/analytics/stream');
    streamUrl.searchParams.set('period', period);
    streamUrl.searchParams.set('token', token);

    // Proxy through fetch to include auth in server (server uses token from header, but for SSE we'll validate in middleware override if present)
    const es = new EventSource(streamUrl.toString());

    es.addEventListener('snapshot', async (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        const analytics = payload.analytics;
        // Map snapshot into local states using existing endpoints shape
        setOverview({
          totalSales: analytics?.totalSales || 0,
          totalPurchases: analytics?.totalPurchases || 0,
          totalExpenses: analytics?.totalExpenses || 0,
          paymentMethods: (analytics?.paymentMethods || []).map((pm: any) => ({ _id: pm.method, total: pm.total, count: pm.count })),
          salesByDate: (analytics?.salesByDate || []).map((sd: any) => ({ _id: sd.date, total: sd.sales, count: sd.orders }))
        });
        setTopProducts((analytics?.topProducts || []).map((p: any) => ({ _id: p.productName, totalQuantity: p.totalQuantity, totalAmount: p.totalAmount, count: p.orderCount })));
        setTopCustomers((analytics?.topCustomers || []).map((c: any) => ({ _id: c.customerName, totalAmount: c.totalAmount, invoiceCount: c.invoiceCount, avgOrderValue: c.avgOrderValue })));
        setPaymentAnalytics({
          paymentFlow: [
            { _id: 'Received', total: analytics?.paymentFlow?.moneyIn?.total || 0, count: analytics?.paymentFlow?.moneyIn?.count || 0 },
            { _id: 'Paid', total: analytics?.paymentFlow?.moneyOut?.total || 0, count: analytics?.paymentFlow?.moneyOut?.count || 0 },
          ],
          paymentMethods: (analytics?.paymentMethods || []).map((pm: any) => ({ _id: pm.method, total: pm.total, count: pm.count })),
          dailyPayments: (analytics?.dailyPayments || []).map((dp: any) => ({ _id: dp.date, received: dp.received, paid: dp.paid }))
        });
      } catch { /* ignore */ }
    });

    es.addEventListener('update', async () => {
      // On updates, refetch via existing fetch to reuse mapping and handle filters
      fetchInsights();
    });

    es.addEventListener('error', () => {
      // Best-effort: close and rely on manual refresh
      try { es.close(); } catch {}
    });

    return () => {
      try { es.close(); } catch {}
    };
  }, [dateRange]);

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const periodMap: { [key: string]: string } = {
        '7': '7days',
        '30': '30days',
        '90': '90days',
        '365': '1year'
      };
      const period = periodMap[dateRange] || '30days';

      const [overviewRes, productsRes, customersRes, paymentsRes] = await Promise.all([
        fetch(`https://invoice-swift-backend-production.up.railway.app/api/analytics/overview?period=${period}&${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`https://invoice-swift-backend-production.up.railway.app/api/analytics/top-products?period=${period}&${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`https://invoice-swift-backend-production.up.railway.app/api/analytics/top-customers?period=${period}&${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`https://invoice-swift-backend-production.up.railway.app/api/analytics/payments?period=${period}&${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setOverview(data);
      } else {
        setError('Failed to fetch overview data');
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        setTopProducts(data);
      }

      if (customersRes.ok) {
        const data = await customersRes.json();
        setTopCustomers(data);
      }

      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPaymentAnalytics(data);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const periodMap: { [key: string]: string } = {
        '7': '7days',
        '30': '30days',
        '90': '90days',
        '365': '1year'
      };
      const period = periodMap[dateRange] || '30days';
      
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/analytics/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ period })
      });

      if (response.ok) {
        fetchInsights();
      } else {
        setError('Failed to update analytics');
      }
    } catch (error) {
      setError('Network error while updating analytics');
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Chart colors - Black and white theme
  const CHART_COLORS = ['#000000', '#666666', '#999999', '#CCCCCC', '#333333', '#555555', '#777777', '#AAAAAA'];

  // Format chart data
  const formatSalesChartData = () => {
    if (!overview?.salesByDate) return [];
    return overview.salesByDate.map(item => ({
      date: formatDate(item._id),
      sales: item.total,
      orders: item.count
    }));
  };

  const formatPaymentMethodsChartData = () => {
    if (!paymentAnalytics?.paymentMethods) return [];
    return paymentAnalytics.paymentMethods.map((method, index) => ({
      name: method._id,
      value: method.total,
      count: method.count,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));
  };

  const formatRevenueChartData = () => {
    const data = [
      {
        category: 'Sales',
        amount: overview?.totalSales || 0,
        color: '#000000'
      },
      {
        category: 'Purchases',
        amount: overview?.totalPurchases || 0,
        color: '#666666'
      },
      {
        category: 'Expenses',
        amount: overview?.totalExpenses || 0,
        color: '#999999'
      }
    ];
    // Return real data only - no fake/sample data
    return data;
  };

  // Chart configurations
  const salesChartConfig: ChartConfig = {
    sales: {
      label: "Sales Amount",
      color: "hsl(0, 0%, 0%)",
    },
    orders: {
      label: "Number of Orders",
      color: "hsl(0, 0%, 40%)",
    },
  };

  const getPaymentMethodsChartConfig = (): ChartConfig => {
    if (!paymentAnalytics?.paymentMethods) return {};
    return paymentAnalytics.paymentMethods.reduce((acc, method, index) => {
      acc[method._id] = {
        label: method._id,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
      return acc;
    }, {} as ChartConfig);
  };

  const revenueChartConfig: ChartConfig = {
    Sales: {
      label: "Sales",
      color: "hsl(0, 0%, 0%)",
    },
    Purchases: {
      label: "Purchases",
      color: "hsl(0, 0%, 40%)",
    },
    Expenses: {
      label: "Expenses",
      color: "hsl(0, 0%, 60%)",
    },
  };

  const paymentTrendsChartConfig: ChartConfig = {
    received: {
      label: "Money Received",
      color: "hsl(0, 0%, 0%)",
    },
    paid: {
      label: "Money Paid",
      color: "hsl(0, 0%, 40%)",
    },
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Insights & Analytics</h1>
              <p className="mt-2 text-gray-600">Comprehensive business analytics and financial insights</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={updateAnalytics}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Analytics
              </Button>
              <Button variant="outline" onClick={fetchInsights}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Date Range Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Date Range Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quick Select
                  </label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
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
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setDateRange('30');
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Net Profit</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatAmount((overview?.totalSales || 0) - (overview?.totalPurchases || 0) - (overview?.totalExpenses || 0))}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Top Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{topCustomers.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Top Products</p>
                    <p className="text-2xl font-bold text-gray-900">{topProducts.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Payment Methods</p>
                    <p className="text-2xl font-bold text-gray-900">{paymentAnalytics?.paymentMethods?.length || 0}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatAmount(overview?.totalSales || 0)}
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-gray-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Purchases</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatAmount(overview?.totalPurchases || 0)}
                    </p>
                  </div>
                  <ShoppingCart className="w-12 h-12 text-gray-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatAmount(overview?.totalExpenses || 0)}
                    </p>
                  </div>
                  <TrendingDown className="w-12 h-12 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Payment Methods Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Payment Methods Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentAnalytics?.paymentMethods && paymentAnalytics.paymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    <div className="h-[300px] w-full">
                      <ChartContainer
                        config={getPaymentMethodsChartConfig()}
                        className="h-full w-full"
                        style={{ aspectRatio: 'unset' }}
                      >
                      <RechartsPieChart>
                        <Pie
                          data={formatPaymentMethodsChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {formatPaymentMethodsChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatAmount(value as number)} />} />
                        <ChartLegend content={<ChartLegendContent />} />
                      </RechartsPieChart>
                      </ChartContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {paymentAnalytics.paymentMethods.map((method, index) => (
                        <div key={method._id} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          ></div>
                          <span className="font-medium">{method._id}</span>
                          <span className="text-gray-500">({method.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No payment data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Revenue Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={revenueChartConfig}
                    className="h-full w-full"
                    style={{ aspectRatio: 'unset' }}
                  >
                    <BarChart data={formatRevenueChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                      <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatAmount(value as number)} />} />
                      <Bar dataKey="amount" fill="#000000" radius={[4, 4, 0, 0]}>
                        {formatRevenueChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Payment Trends */}
          {paymentAnalytics?.dailyPayments && paymentAnalytics.dailyPayments.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Daily Payment Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={paymentTrendsChartConfig}
                    className="h-full w-full"
                    style={{ aspectRatio: 'unset' }}
                  >
                  <LineChart data={paymentAnalytics.dailyPayments} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatAmount(value as number)} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="received"
                      stroke="#000000"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="paid"
                      stroke="#666666"
                      strokeWidth={2}
                    />
                  </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.slice(0, 5).map((product, index) => (
                      <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product._id}</p>
                            <p className="text-sm text-gray-500">
                              {product.totalQuantity} units sold
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatAmount(product.totalAmount)}</p>
                          <p className="text-sm text-gray-500">{product.count} orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No product data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Top Customers by Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topCustomers.length > 0 ? (
                  <div className="space-y-4">
                    {topCustomers.slice(0, 5).map((customer, index) => (
                      <div key={customer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{customer._id}</p>
                            <p className="text-sm text-gray-500">
                              {customer.invoiceCount} invoices
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatAmount(customer.totalAmount)}</p>
                          <p className="text-sm text-gray-500">
                            Avg: {formatAmount(customer.avgOrderValue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No customer data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sales Trend Chart */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sales Trend Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overview?.salesByDate && overview.salesByDate.length > 0 ? (
                <div className="h-[400px] w-full">
                  <ChartContainer
                    config={salesChartConfig}
                    className="h-full w-full"
                    style={{ aspectRatio: 'unset' }}
                  >
                  <ComposedChart data={formatSalesChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000000" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#000000" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => value.toString()} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatAmount(value as number)} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="sales"
                      stroke="#000000"
                      fillOpacity={1}
                      fill="url(#salesGradient)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#666666"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                  </ChartContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No sales data available for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Insights;

