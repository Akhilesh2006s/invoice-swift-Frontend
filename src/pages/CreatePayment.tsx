import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  Building2,
  User,
  CreditCard
} from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface FormData {
  customerId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  referenceType: string;
  referenceNumber: string;
  description: string;
  notes: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
  };
}

const CreatePayment: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customersLoading, setCustomersLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    customerId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 0,
    paymentMethod: 'Cash',
    paymentType: 'Received',
    referenceType: 'manual',
    referenceNumber: '',
    description: '',
    notes: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: ''
    }
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Helper function to safely trim strings
  const safeTrim = (value: any): string | undefined => {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.customerId) {
      setError('Please select a customer');
      setLoading(false);
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Filter out empty fields before sending
      const dataToSend = {
        customerId: formData.customerId,
        paymentDate: formData.paymentDate,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentType: formData.paymentType,
        referenceType: formData.referenceType,
        referenceNumber: safeTrim(formData.referenceNumber),
        description: safeTrim(formData.description),
        notes: safeTrim(formData.notes),
        bankDetails: formData.bankDetails.bankName ? {
          bankName: safeTrim(formData.bankDetails.bankName),
          accountNumber: safeTrim(formData.bankDetails.accountNumber),
          ifscCode: safeTrim(formData.bankDetails.ifscCode),
          upiId: safeTrim(formData.bankDetails.upiId)
        } : undefined
      };

      console.log('Submitting payment:', dataToSend);
      
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        navigate('/payments');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Payment creation failed');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      setError('Network error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/payments')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Payment</h1>
            <p className="text-muted-foreground">Record a new payment transaction</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Payment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer *</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={customersLoading ? "Loading customers..." : "Select customer"} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer._id} value={customer._id}>
                          {customer.name} ({customer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentType">Payment Type *</Label>
                  <Select
                    value={formData.paymentType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Received">Received</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date *</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Reference & Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="referenceType">Reference Type</Label>
                  <Select
                    value={formData.referenceType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, referenceType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referenceNumber">Reference Number</Label>
                  <Input
                    id="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                    placeholder="Enter reference number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter payment description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {formData.paymentMethod === 'Bank Transfer' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Bank Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankDetails.bankName}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        bankDetails: { ...prev.bankDetails, bankName: e.target.value }
                      }))}
                      placeholder="Enter bank name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={formData.bankDetails.accountNumber}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
                      }))}
                      placeholder="Enter account number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      value={formData.bankDetails.ifscCode}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        bankDetails: { ...prev.bankDetails, ifscCode: e.target.value }
                      }))}
                      placeholder="Enter IFSC code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      value={formData.bankDetails.upiId}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        bankDetails: { ...prev.bankDetails, upiId: e.target.value }
                      }))}
                      placeholder="Enter UPI ID"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/payments')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Payment'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreatePayment;
