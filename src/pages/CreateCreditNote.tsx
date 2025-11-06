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
  Plus, 
  Trash2, 
  Calculator,
  FileText,
  AlertCircle
} from 'lucide-react';

interface Company {
  _id: string;
  businessName: string;
  companyName: string;
  companyLogo: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{
    itemName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxPercent: number;
    netAmount: number;
  }>;
  subtotal: number;
  taxAmount: number;
  totalDiscount: number;
  totalAmount: number;
}

interface CreditNoteItem {
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxPercent: number;
  netAmount: number;
}

interface CreditNoteFormData {
  companyId: string;
  originalInvoiceId: string;
  originalInvoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  reason: string;
  description: string;
  items: CreditNoteItem[];
  subtotal: number;
  taxAmount: number;
  totalDiscount: number;
  totalAmount: number;
  notes: string;
}

const CreateCreditNote: React.FC = () => {
  console.log('CreateCreditNote component rendering...');
  
  // Add error boundary for component initialization
  try {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(false);
    const [invoicesLoading, setInvoicesLoading] = useState(true);
    const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreditNoteFormData>({
    companyId: '',
    originalInvoiceId: '',
    originalInvoiceNumber: '',
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    reason: '',
    description: '',
    items: [],
    subtotal: 0,
    taxAmount: 0,
    totalDiscount: 0,
    totalAmount: 0,
    notes: ''
  });

  useEffect(() => {
    console.log('CreateCreditNote useEffect running...');
    try {
      fetchCompanies();
      fetchInvoices();
    } catch (error) {
      console.error('Error in CreateCreditNote useEffect:', error);
      setError('Failed to initialize form. Please refresh the page.');
    }
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/company', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, companyId: data[0]._id }));
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      setInvoicesLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching invoices...');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/invoices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Invoices response:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Invoices data:', data);
        setInvoices(data.invoices || []);
      } else {
        console.error('Failed to fetch invoices:', response.status, response.statusText);
        setError('Failed to load invoices. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Network error while loading invoices. Please check your connection.');
    } finally {
      setInvoicesLoading(false);
    }
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    try {
      console.log('Invoice selected:', invoiceId);
      const invoice = invoices.find(inv => inv._id === invoiceId);
      if (invoice) {
        console.log('Invoice found:', invoice);
        setSelectedInvoice(invoice);
        setFormData(prev => ({
          ...prev,
          originalInvoiceId: invoice._id,
          originalInvoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customerName,
          customerEmail: invoice.customerEmail,
          customerPhone: invoice.customerPhone,
          customerAddress: invoice.customerAddress,
          items: invoice.items.map(item => ({ ...item }))
        }));
        calculateTotals(invoice.items);
      }
    } catch (error) {
      console.error('Error selecting invoice:', error);
      setError('Error selecting invoice. Please try again.');
    }
  };

  const calculateTotals = (items: CreditNoteItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalDiscount = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + (itemTotal * item.discount / 100);
    }, 0);
    const taxableAmount = subtotal - totalDiscount;
    const taxAmount = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemDiscount = itemTotal * item.discount / 100;
      const itemTaxable = itemTotal - itemDiscount;
      return sum + (itemTaxable * item.taxPercent / 100);
    }, 0);
    const totalAmount = taxableAmount + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      totalDiscount,
      taxAmount,
      totalAmount
    }));
  };

  const handleItemChange = (index: number, field: keyof CreditNoteItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate net amount for this item
    const item = newItems[index];
    const itemTotal = item.quantity * item.unitPrice;
    const itemDiscount = itemTotal * (item.discount / 100);
    const itemTaxable = itemTotal - itemDiscount;
    const itemTax = itemTaxable * (item.taxPercent / 100);
    newItems[index].netAmount = itemTaxable + itemTax;

    setFormData(prev => ({ ...prev, items: newItems }));
    calculateTotals(newItems);
  };

  const addItem = () => {
    const newItem = {
      itemName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxPercent: 0,
      netAmount: 0
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
    calculateTotals(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.companyId) {
      setError('Please select a company');
      setLoading(false);
      return;
    }

    if (!formData.originalInvoiceId) {
      setError('Please select an original invoice');
      setLoading(false);
      return;
    }

    if (!formData.customerName) {
      setError('Customer name is required');
      setLoading(false);
      return;
    }

    if (!formData.reason) {
      setError('Please select a reason for the credit note');
      setLoading(false);
      return;
    }

    if (!formData.items || formData.items.length === 0) {
      setError('Please add at least one item');
      setLoading(false);
      return;
    }

    // Validate items
    for (const item of formData.items) {
      if (!item.description || item.quantity <= 0 || item.unitPrice <= 0) {
        setError('Please fill in all item details correctly');
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Submitting credit note:', formData);
      // Filter out empty fields before sending
      const dataToSend = {
        ...formData,
        customerId: formData.customerId || undefined,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone || undefined,
        customerAddress: formData.customerAddress || undefined,
        description: formData.description || undefined,
        notes: formData.notes || undefined
      };

      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/credit-notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('Credit note response:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('Credit note created:', result);
        navigate('/credit-notes');
      } else {
        const errorData = await response.json();
        console.error('Credit note creation failed:', errorData);
        setError(errorData.message || 'Failed to create credit note');
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  try {
    return (
      <DashboardLayout>
        <div className="p-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/credit-notes')}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Credit Notes
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create Credit Note</h1>
          <p className="mt-2 text-gray-600">Create a credit note for sales returns and adjustments</p>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, companyId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company._id} value={company._id}>
                          {company.businessName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Original Invoice Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Original Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice">Select Original Invoice *</Label>
                  <Select 
                    value={formData.originalInvoiceId} 
                    onValueChange={handleInvoiceSelect}
                    disabled={invoicesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        invoicesLoading 
                          ? "Loading invoices..." 
                          : invoices.length === 0 
                            ? "No invoices available" 
                            : "Select invoice"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {invoicesLoading ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          Loading invoices...
                        </div>
                      ) : invoices.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          No invoices available
                        </div>
                      ) : (
                        invoices
                          .filter(invoice => invoice._id && invoice.invoiceNumber)
                          .map((invoice) => (
                            <SelectItem 
                              key={invoice._id} 
                              value={invoice._id}
                            >
                              {invoice.invoiceNumber} - {invoice.customerName}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                  {invoicesLoading && (
                    <p className="text-sm text-gray-500 mt-1">Loading invoices...</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="reason">Reason for Credit Note *</Label>
                  <Select
                    value={formData.reason}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Return of Goods">Return of Goods</SelectItem>
                      <SelectItem value="Defective Product">Defective Product</SelectItem>
                      <SelectItem value="Wrong Product">Wrong Product</SelectItem>
                      <SelectItem value="Overcharged">Overcharged</SelectItem>
                      <SelectItem value="Cancellation">Cancellation</SelectItem>
                      <SelectItem value="Discount Adjustment">Discount Adjustment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the reason for this credit note..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          {selectedInvoice && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Customer Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Customer Phone</Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerAddress">Customer Address</Label>
                    <Textarea
                      id="customerAddress"
                      value={formData.customerAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Items to Credit</span>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Select an invoice to load items, or add items manually
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div>
                          <Label>Item Name *</Label>
                          <Input
                            value={item.itemName}
                            onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <div>
                          <Label>Unit Price *</Label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <div>
                          <Label>Discount %</Label>
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label>Tax %</Label>
                          <Input
                            type="number"
                            value={item.taxPercent}
                            onChange={(e) => handleItemChange(index, 'taxPercent', parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Net Amount: ₹{(item.netAmount || 0).toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Credit Note Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{(formData.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Discount:</span>
                    <span>-₹{(formData.totalDiscount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Amount:</span>
                    <span>₹{(formData.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Credit Amount:</span>
                      <span className="text-red-600">₹{(formData.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes for this credit note..."
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/credit-notes')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Credit Note'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
  } catch (error) {
    console.error('Error rendering CreateCreditNote:', error);
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Form</h1>
            <p className="text-gray-600 mb-4">There was an error loading the credit note form.</p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  } catch (initError) {
    console.error('Error initializing CreateCreditNote:', initError);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Component Error</h1>
          <p className="text-gray-600 mb-4">Failed to initialize the credit note form.</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
  }
};

export default CreateCreditNote;
