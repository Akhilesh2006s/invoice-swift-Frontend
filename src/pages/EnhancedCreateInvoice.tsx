import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  ArrowLeft,
  Calculator,
  Building2,
  User,
  Search,
  Edit,
  CreditCard,
  FileImage
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CustomerSelector from '@/components/CustomerSelector';
import ItemSelector from '@/components/ItemSelector';

interface Company {
  _id: string;
  businessName: string;
  companyName: string;
  companyLogo: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

interface Item {
  _id: string;
  itemType: string;
  itemName: string;
  description: string;
  basePrice: number;
  isTaxIncluded: boolean;
  sellingPrice: number;
  taxPercent: number;
  primaryUnit: string;
}

interface InvoiceItem {
  itemId: string;
  itemName: string;
  itemType: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  primaryUnit: string;
  lineTotal: number;
  taxAmount: number;
  netAmount: number;
}

interface BankAccount {
  _id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  isDefault: boolean;
}

const EnhancedCreateInvoice: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [bankDetails, setBankDetails] = useState<BankAccount | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    notes: ''
  });

  useEffect(() => {
    fetchCompanies();
    fetchBankDetails();
    fetchSignature();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/company', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const companies = await response.json();
        setCompanies(companies);
        const defaultCompany = companies.find((c: Company) => c.isDefault) || companies[0];
        setSelectedCompany(defaultCompany);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/bank-accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const accounts = await response.json();
        const defaultBank = accounts.find((b: BankAccount) => b.isDefault);
        setBankDetails(defaultBank);
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };

  const fetchSignature = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/user/signature', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSignature(data.signature);
      }
    } catch (error) {
      console.error('Error fetching signature:', error);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerSelector(false);
  };

  const handleItemSelect = (item: Item) => {
    const newInvoiceItem: InvoiceItem = {
      itemId: item._id,
      itemName: item.itemName,
      itemType: item.itemType,
      description: item.description,
      quantity: 1,
      unitPrice: item.sellingPrice,
      discountPercent: 0,
      taxPercent: item.taxPercent,
      primaryUnit: item.primaryUnit,
      lineTotal: item.sellingPrice,
      taxAmount: (item.sellingPrice * item.taxPercent) / 100,
      netAmount: item.sellingPrice + ((item.sellingPrice * item.taxPercent) / 100)
    };
    setInvoiceItems([...invoiceItems, newInvoiceItem]);
    setShowItemSelector(false);
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: number) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate amounts
    const item = updatedItems[index];
    const discountAmount = (item.unitPrice * item.quantity * item.discountPercent) / 100;
    item.lineTotal = (item.unitPrice * item.quantity) - discountAmount;
    item.taxAmount = (item.lineTotal * item.taxPercent) / 100;
    item.netAmount = item.lineTotal + item.taxAmount;
    
    setInvoiceItems(updatedItems);
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const totalDiscount = invoiceItems.reduce((sum, item) => sum + ((item.unitPrice * item.quantity * item.discountPercent) / 100), 0);
    const taxableAmount = subtotal - totalDiscount;
    const totalTax = invoiceItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalAmount = invoiceItems.reduce((sum, item) => sum + item.netAmount, 0);
    
    return {
      subtotal,
      totalDiscount,
      taxableAmount,
      totalTax,
      totalAmount
    };
  };

  const handleSubmit = async () => {
    if (!selectedCompany || !selectedCustomer || invoiceItems.length === 0) {
      setMessage({ type: 'error', text: 'Please select company, customer, and add at least one item' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const totals = calculateTotals();
      
      const invoicePayload = {
        companyId: selectedCompany._id,
        customerId: selectedCustomer._id,
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email,
        customerPhone: selectedCustomer.phone,
        customerAddress: formatCustomerAddress(selectedCustomer.address),
        items: invoiceItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          taxPercent: item.taxPercent,
          total: item.netAmount
        })),
        subTotal: totals.subtotal,
        totalDiscount: totals.totalDiscount,
        taxableAmount: totals.taxableAmount,
        taxAmount: totals.totalTax,
        totalAmount: totals.totalAmount,
        paymentMethod: invoiceData.paymentMethod,
        status: invoiceData.paymentStatus,
        notes: invoiceData.notes,
        dueDate: invoiceData.dueDate,
        bankDetails: bankDetails ? {
          bankName: bankDetails.bankName,
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode
        } : null,
        signature: signature
      };

      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoicePayload)
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Invoice created successfully!' });
        setTimeout(() => window.location.href = '/invoices', 2000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error creating invoice' });
    } finally {
      setLoading(false);
    }
  };

  const formatCustomerAddress = (address: Customer['address']) => {
    return [address.street, address.city, address.state, address.pincode, address.country]
      .filter(part => part && part.trim()).join(', ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const totals = calculateTotals();

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <Link to="/invoices" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Enhanced Invoice</h1>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
            {message.text}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={selectedCompany?._id || ''}
                  onChange={(e) => {
                    const company = companies.find(c => c._id === e.target.value);
                    setSelectedCompany(company || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company._id} value={company._id}>
                      {company.businessName} - {company.companyName}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </div>
                  <Button onClick={() => setShowCustomerSelector(!showCustomerSelector)}>
                    <Search className="w-4 h-4 mr-2" />
                    {selectedCustomer ? 'Change Customer' : 'Select Customer'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showCustomerSelector && (
                  <CustomerSelector 
                    onCustomerSelect={handleCustomerSelect}
                    selectedCustomerId={selectedCustomer?._id}
                  />
                )}
                {selectedCustomer && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-900">{selectedCustomer.name}</h3>
                    <p className="text-sm text-green-700">{selectedCustomer.email}</p>
                    <p className="text-sm text-green-700">{selectedCustomer.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Invoice Items
                  </div>
                  <Button onClick={() => setShowItemSelector(!showItemSelector)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showItemSelector && (
                  <div className="mb-6">
                    <ItemSelector 
                      onItemSelect={handleItemSelect}
                      onAddItem={handleItemSelect}
                    />
                  </div>
                )}

                {invoiceItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No items added yet</p>
                    <p className="text-sm text-gray-500">Add items to create your invoice</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoiceItems.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{item.itemName}</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {item.itemType}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeInvoiceItem(index)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label>Discount %</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={item.discountPercent}
                              onChange={(e) => updateInvoiceItem(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label>Net Amount</Label>
                            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                              {formatCurrency(item.netAmount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment & Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Payment & Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Payment Method</Label>
                    <select
                      value={invoiceData.paymentMethod}
                      onChange={(e) => setInvoiceData({...invoiceData, paymentMethod: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                  <div>
                    <Label>Payment Status</Label>
                    <select
                      value={invoiceData.paymentStatus}
                      onChange={(e) => setInvoiceData({...invoiceData, paymentStatus: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Fully Paid</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <textarea
                    value={invoiceData.notes}
                    onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                    placeholder="Enter any additional notes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Invoice Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Discount:</span>
                  <span className="text-red-600">-{formatCurrency(totals.totalDiscount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxable Amount:</span>
                  <span>{formatCurrency(totals.taxableAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Tax:</span>
                  <span>{formatCurrency(totals.totalTax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-3">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(totals.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            {bankDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Bank Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Bank:</span> {bankDetails.bankName}</div>
                    <div><span className="font-medium">Account:</span> {bankDetails.accountNumber}</div>
                    <div><span className="font-medium">IFSC:</span> {bankDetails.ifscCode}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Signature */}
            {signature && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileImage className="w-5 h-5 mr-2" />
                    Signature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={signature} alt="Signature" className="max-w-full h-20 object-contain border rounded" />
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !selectedCompany || !selectedCustomer || invoiceItems.length === 0}
              className="w-full"
            >
              {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />Save Invoice</>}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EnhancedCreateInvoice;

