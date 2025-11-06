import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle
} from 'lucide-react';

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
  referenceType: string;
  createdAt: string;
}

interface CustomerStatement {
  payments: Payment[];
  balance: number;
  customer: Customer;
}

const CustomerStatements: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [statement, setStatement] = useState<CustomerStatement | null>(null);
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerStatement();
    }
  }, [selectedCustomer, startDate, endDate]);

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching customers...');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Customers fetched:', data);
        setCustomers(data.customers || []);
      } else {
        console.error('Failed to fetch customers:', response.status);
        setError('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Network error while fetching customers');
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchCustomerStatement = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      console.log('Fetching customer statement for:', selectedCustomer);
      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/payments/customer/${selectedCustomer}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Customer statement fetched:', data);
        setStatement(data);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch customer statement:', errorData);
        setError(errorData.message || 'Failed to fetch customer statement');
      }
    } catch (error) {
      console.error('Error fetching customer statement:', error);
      setError('Network error while fetching customer statement');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStatement = async () => {
    if (!selectedCustomer) return;
    
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/payments/customer/${selectedCustomer}/download?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customer-statement-${selectedCustomer}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading statement:', error);
    }
  };

  const getPaymentTypeBadge = (type: string) => {
    if (type === 'Received') {
      return <Badge className="bg-green-100 text-green-800">Received</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Paid</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getReferenceDisplay = (payment: Payment) => {
    if (payment.referenceType === 'invoice') {
      return `Invoice: ${payment.referenceNumber}`;
    } else if (payment.referenceType === 'purchase') {
      return `Purchase: ${payment.referenceNumber}`;
    } else {
      return payment.referenceNumber || 'N/A';
    }
  };

  const formatAddress = (address: any) => {
    if (typeof address === 'string') {
      return address;
    }
    if (typeof address === 'object' && address !== null) {
      return [address.street, address.city, address.state, address.pincode, address.country]
        .filter(part => part && part.trim()).join(', ');
    }
    return 'N/A';
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Statements</h1>
              <p className="mt-2 text-gray-600">View detailed payment history for customers</p>
            </div>
            {selectedCustomer && (
              <Button 
                onClick={handleDownloadStatement}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Statement
              </Button>
            )}
          </div>

          {/* Customer Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Select Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer *
                  </label>
                  <Select 
                    value={selectedCustomer} 
                    onValueChange={setSelectedCustomer}
                    disabled={customersLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        customersLoading 
                          ? "Loading customers..." 
                          : customers.length === 0 
                            ? "No customers found" 
                            : "Choose a customer"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer._id} value={customer._id}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-gray-500">{customer.phone}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {error && customers.length === 0 && !customersLoading && (
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  )}
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

          {/* Error Display */}
          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Customer Statement */}
          {selectedCustomer && (
            loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Loading customer statement...</span>
              </div>
            ) : statement ? (
              <div className="space-y-6">
                {/* Customer Info */}
                {statement.customer && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{statement.customer?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">Customer Name</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{statement.customer?.phone || 'N/A'}</p>
                          <p className="text-sm text-gray-500">Phone</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{statement.customer?.email || 'N/A'}</p>
                          <p className="text-sm text-gray-500">Email</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{formatAddress(statement.customer?.address)}</p>
                          <p className="text-sm text-gray-500">Address</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Payments</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {statement.payments?.length || 0}
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-green-600">
                            ₹{(statement.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0).toLocaleString()}
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
                          <p className="text-sm text-gray-600">Balance</p>
                          <p className="text-2xl font-bold text-purple-600">
                            ₹{(statement.balance || 0).toLocaleString()}
                          </p>
                        </div>
                        <TrendingDown className="w-8 h-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Payment History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!statement.payments || statement.payments.length === 0 ? (
                      <div className="text-center py-8">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">No payments found for this customer.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {statement.payments.map((payment, index) => (
                          <div key={payment._id} className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className="flex-shrink-0">
                              <div className={`w-3 h-3 rounded-full ${
                                payment.paymentType === 'Received' ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              {index < (statement.payments?.length || 0) - 1 && (
                                <div className="w-px h-8 bg-gray-200 ml-1 mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-blue-600">
                                    {payment.paymentNumber}
                                  </span>
                                  {getPaymentTypeBadge(payment.paymentType)}
                                  {getStatusBadge(payment.status)}
                                </div>
                                <div className="text-right">
                                  <p className={`font-bold ${
                                    payment.paymentType === 'Received' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {payment.paymentType === 'Received' ? '+' : '-'}₹{payment.amount.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(payment.paymentDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Method:</span> {payment.paymentMethod}
                                </div>
                                <div>
                                  <span className="font-medium">Reference:</span> {getReferenceDisplay(payment)}
                                </div>
                                <div>
                                  <span className="font-medium">Description:</span> {payment.description || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No statement data available for this customer.</p>
              </div>
            )
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerStatements;
