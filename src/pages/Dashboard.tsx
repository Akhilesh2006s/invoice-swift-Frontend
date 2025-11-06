import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useMemo } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<{ totalSales: number; totalPurchases: number; totalExpenses: number; salesByDate: any[] } | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login if not authenticated
      window.location.href = "/login";
    }
    setLoading(false);
  }, []);

  // Load analytics overview snapshot and live updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetch('https://invoice-swift-backend-production.up.railway.app/api/analytics/overview?period=30days', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setOverview({ totalSales: data.totalSales, totalPurchases: data.totalPurchases, totalExpenses: data.totalExpenses, salesByDate: data.salesByDate });
        }
      } catch {}
    };
    load();

    const streamUrl = new URL('https://invoice-swift-backend-production.up.railway.app/api/analytics/stream');
    streamUrl.searchParams.set('period', '30days');
    streamUrl.searchParams.set('token', token);
    const es = new EventSource(streamUrl.toString());
    const refresh = async () => { await load(); };
    es.addEventListener('update', refresh as any);
    es.addEventListener('snapshot', refresh as any);
    es.addEventListener('error', () => { try { es.close(); } catch {} });
    return () => { try { es.close(); } catch {} };
  }, []);

  const salesSparkData = useMemo(() => {
    return (overview?.salesByDate || []).map((d: any) => ({ date: d._id, sales: d.total }));
  }, [overview]);

  const sparkConfig: ChartConfig = {
    sales: { label: 'Sales', color: 'hsl(0,0%,0%)' },
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}!
            {user.company && <span className="block text-sm text-gray-500">Company: {user.company}</span>}
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Invoices</CardTitle>
              <CardDescription>All time invoices created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+0% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Payments</CardTitle>
              <CardDescription>Invoices awaiting payment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">$0.00 total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Month</CardTitle>
              <CardDescription>Revenue this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{((overview?.totalSales || 0) / 1).toLocaleString('en-IN')}</div>
              <div className="mt-3 h-20 w-full">
                <ChartContainer config={sparkConfig} className="h-full w-full" style={{ aspectRatio: 'unset' }}>
                  <AreaChart data={salesSparkData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000000" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#000000" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent formatter={(v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v as number)} />} />
                    <Area type="monotone" dataKey="sales" stroke="#000000" fillOpacity={1} fill="url(#sparkGradient)" />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => navigate('/invoices/create')}
            >
              <span className="text-sm font-medium">Create Invoice</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => navigate('/invoices')}
            >
              <span className="text-sm font-medium">View Invoices</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => navigate('/customers')}
            >
              <span className="text-sm font-medium">Add Customer</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => navigate('/reports')}
            >
              <span className="text-sm font-medium">Reports</span>
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <p>No recent activity</p>
                <p className="text-sm mt-2">Start by creating your first invoice!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

