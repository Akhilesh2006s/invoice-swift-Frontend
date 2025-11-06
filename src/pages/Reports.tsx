import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  Receipt,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  FileImage,
  Database
} from 'lucide-react';

interface BusinessSummary {
  sales: {
    totalInvoices: number;
    totalSales: number;
    totalTax: number;
    avgOrderValue: number;
  };
  purchases: {
    totalPurchases: number;
    totalAmount: number;
    avgPurchaseValue: number;
  };
  expenses: {
    totalExpenses: number;
    totalAmount: number;
    avgExpenseValue: number;
  };
  payments: {
    totalPayments: number;
    totalReceived: number;
    totalPaid: number;
  };
}

const Reports: React.FC = () => {
  const [summary, setSummary] = useState<BusinessSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('business');

  useEffect(() => {
    fetchBusinessSummary();
  }, [startDate, endDate]);

  const fetchBusinessSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/reports/business-summary?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        setError('Failed to fetch business summary');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/reports/business-summary/excel?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `business-summary-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      setError('Failed to download Excel report');
    }
  };

  const downloadReport = async (reportType: string, format: 'excel' | 'json') => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('format', format);

      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/reports/${reportType}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        if (format === 'excel') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch (error) {
      setError(`Failed to download ${reportType} report`);
    }
  };

  const downloadGSTR = async (type: 'gstr-1' | 'gstr-2b' | 'gstr-3b') => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/reports/${type}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      setError(`Failed to download ${type.toUpperCase()} report`);
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
              <h1 className="text-3xl font-bold text-gray-900">Reports & Statements</h1>
              <p className="mt-2 text-gray-600">Comprehensive business reports and GST filings</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchBusinessSummary}>
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
                Report Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Business Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatAmount(summary?.sales.totalSales || 0)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {summary?.sales.totalInvoices || 0} invoices
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Purchases</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatAmount(summary?.purchases.totalAmount || 0)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {summary?.purchases.totalPurchases || 0} purchases
                    </p>
                  </div>
                  <ShoppingCart className="w-12 h-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatAmount(summary?.expenses.totalAmount || 0)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {summary?.expenses.totalExpenses || 0} expenses
                    </p>
                  </div>
                  <Receipt className="w-12 h-12 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Net Cash Flow</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatAmount((summary?.payments.totalReceived || 0) - (summary?.payments.totalPaid || 0))}
                    </p>
                    <p className="text-sm text-gray-500">
                      {summary?.payments.totalPayments || 0} transactions
                    </p>
                  </div>
                  <CreditCard className="w-12 h-12 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comprehensive Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales & Credit Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Sales & Credit Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="font-medium">Sales Report</p>
                        <p className="text-sm text-gray-500">All sales transactions</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => downloadReport('sales', 'excel')} size="sm">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Excel
                      </Button>
                      <Button onClick={() => downloadReport('sales', 'json')} size="sm" variant="outline">
                        <Database className="w-4 h-4 mr-2" />
                        JSON
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium">Credit Notes</p>
                        <p className="text-sm text-gray-500">Sales returns & credits</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => downloadReport('credit-notes', 'excel')} size="sm">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Excel
                      </Button>
                      <Button onClick={() => downloadReport('credit-notes', 'json')} size="sm" variant="outline">
                        <Database className="w-4 h-4 mr-2" />
                        JSON
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase & Debit Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Purchase & Debit Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-8 h-8 text-orange-500" />
                      <div>
                        <p className="font-medium">Purchase Report</p>
                        <p className="text-sm text-gray-500">All purchase transactions</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => downloadReport('purchases', 'excel')} size="sm">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Excel
                      </Button>
                      <Button onClick={() => downloadReport('purchases', 'json')} size="sm" variant="outline">
                        <Database className="w-4 h-4 mr-2" />
                        JSON
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-8 h-8 text-red-500" />
                      <div>
                        <p className="font-medium">Debit Notes</p>
                        <p className="text-sm text-gray-500">Purchase returns & debits</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => downloadReport('debit-notes', 'excel')} size="sm">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Excel
                      </Button>
                      <Button onClick={() => downloadReport('debit-notes', 'json')} size="sm" variant="outline">
                        <Database className="w-4 h-4 mr-2" />
                        JSON
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Quotation & Expense Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Quotation & Expense Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-purple-500" />
                      <div>
                        <p className="font-medium">Quotation Report</p>
                        <p className="text-sm text-gray-500">All quotations & proposals</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => downloadReport('quotations', 'excel')} size="sm">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Excel
                      </Button>
                      <Button onClick={() => downloadReport('quotations', 'json')} size="sm" variant="outline">
                        <Database className="w-4 h-4 mr-2" />
                        JSON
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="font-medium">Expense Report</p>
                        <p className="text-sm text-gray-500">All business expenses</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => downloadReport('expenses', 'excel')} size="sm">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Excel
                      </Button>
                      <Button onClick={() => downloadReport('expenses', 'json')} size="sm" variant="outline">
                        <Database className="w-4 h-4 mr-2" />
                        JSON
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GST Reports (GetSwipe Format) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  GST Reports (GetSwipe Format)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-8 h-8 text-orange-500" />
                      <div>
                        <p className="font-medium">GSTR-1</p>
                        <p className="text-sm text-gray-500">Outward Supplies (B2B, B2CL, B2CS)</p>
                      </div>
                    </div>
                    <Button onClick={() => downloadGSTR('gstr-1')} size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      JSON
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-8 h-8 text-purple-500" />
                      <div>
                        <p className="font-medium">GSTR-2B</p>
                        <p className="text-sm text-gray-500">Auto-drafted ITC Statement</p>
                      </div>
                    </div>
                    <Button onClick={() => downloadGSTR('gstr-2b')} size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      JSON
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="font-medium">GSTR-3B</p>
                        <p className="text-sm text-gray-500">Monthly Return Summary</p>
                      </div>
                    </div>
                    <Button onClick={() => downloadGSTR('gstr-3b')} size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      JSON
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Detailed Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatAmount(summary?.sales.avgOrderValue || 0)}
                  </div>
                  <div className="text-sm text-gray-500">Avg Order Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatAmount(summary?.purchases.avgPurchaseValue || 0)}
                  </div>
                  <div className="text-sm text-gray-500">Avg Purchase Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatAmount(summary?.expenses.avgExpenseValue || 0)}
                  </div>
                  <div className="text-sm text-gray-500">Avg Expense Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatAmount(summary?.sales.totalTax || 0)}
                  </div>
                  <div className="text-sm text-gray-500">Total Tax Collected</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Business Summary Report</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Complete sales, purchase, and expense data</li>
                      <li>• Financial overview with totals and averages</li>
                      <li>• Download in Excel CSV format</li>
                      <li>• Date range filtering available</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">GST Reports (JSON Format)</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• GSTR-1: Outward supplies and B2B transactions</li>
                      <li>• GSTR-2B: Auto-drafted ITC statement</li>
                      <li>• GSTR-3B: Monthly return with tax calculations</li>
                      <li>• Compatible with GST portal upload</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> All reports are generated based on your transaction data. 
                    GST reports follow the standard JSON format required by the GST portal for easy upload.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
