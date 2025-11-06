import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload
} from 'lucide-react';

interface Expense {
  _id: string;
  expenseNumber: string;
  amount: number;
  expenseDate: string;
  category: string;
  description: string;
  paymentType: string;
  isPaid: boolean;
  paidDate?: string;
  attachments: Array<{
    fileName: string;
    fileType: string;
    fileSize: number;
  }>;
  notes?: string;
  status: string;
  companyId: {
    businessName: string;
    companyName: string;
  };
  createdAt: string;
}

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalCount: 0,
    paidCount: 0,
    paidAmount: 0,
    pendingAmount: 0
  });

  const categories = [
    'Bank Fee and Charges',
    'Electricity Bill',
    'Employee Salaries',
    'Printing',
    'Raw Material',
    'Rent Expense',
    'Repair and Maintenance',
    'Telephone and Internet Bills',
    'Others'
  ];

  const paymentTypes = ['UPI', 'Cash', 'Card', 'Net Banking', 'Cheque'];

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, [searchQuery, categoryFilter, statusFilter, startDate, endDate, currentPage]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchQuery,
        category: categoryFilter === 'all' ? '' : categoryFilter,
        status: statusFilter === 'all' ? '' : statusFilter,
        startDate,
        endDate
      });

      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/expenses?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
        setTotalPages(data.pagination.pages);
      } else {
        setError('Failed to fetch expenses');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/expenses/stats?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.summary);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchExpenses();
        fetchStats();
      } else {
        setError('Failed to delete expense');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const getStatusBadge = (expense: Expense) => {
    if (expense.isPaid) {
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    }
    if (expense.status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
    if (expense.status === 'draft') {
      return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Bank Fee and Charges': 'bg-blue-100 text-blue-800',
      'Electricity Bill': 'bg-yellow-100 text-yellow-800',
      'Employee Salaries': 'bg-green-100 text-green-800',
      'Printing': 'bg-purple-100 text-purple-800',
      'Raw Material': 'bg-orange-100 text-orange-800',
      'Rent Expense': 'bg-red-100 text-red-800',
      'Repair and Maintenance': 'bg-indigo-100 text-indigo-800',
      'Telephone and Internet Bills': 'bg-pink-100 text-pink-800',
      'Others': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
              <p className="mt-2 text-gray-600">Track and manage your business expenses</p>
            </div>
            <Link to="/expenses/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Expense
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatAmount(stats.totalExpenses)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Count</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCount}</p>
                  </div>
                  <FileText className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Paid Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatAmount(stats.paidAmount)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Amount</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {formatAmount(stats.pendingAmount)}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-500" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search expenses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="Start Date"
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="End Date"
                    />
                  </div>
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

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No expenses found.</p>
                  <Link to="/expenses/create">
                    <Button className="mt-4">Add Your First Expense</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Expense #</th>
                        <th className="text-left py-3 px-4">Description</th>
                        <th className="text-left py-3 px-4">Category</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Payment</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="font-medium text-blue-600">
                              {expense.expenseNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{expense.description}</p>
                              {expense.notes && (
                                <p className="text-sm text-gray-500">{expense.notes}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getCategoryColor(expense.category)}>
                              {expense.category}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900">
                              {formatAmount(expense.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-600">
                              {formatDate(expense.expenseDate)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-600">{expense.paymentType}</span>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(expense)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDelete(expense._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
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

export default Expenses;
