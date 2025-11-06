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
  ShoppingCart,
  AlertCircle,
  Calendar,
  Building2,
  CreditCard
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

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface PurchaseItem {
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxPercent: number;
  netAmount: number;
}

interface PurchaseFormData {
  companyId: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  vendorAddress: string;
  vendorGSTIN: string;
  dueDate: string;
  items: PurchaseItem[];
  subtotal: number;
  taxAmount: number;
  totalDiscount: number;
  totalAmount: number;
  paymentMethod: string;
  notes: string;
}

const CreatePurchase: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vendorsLoading, setVendorsLoading] = useState(true);

  const [formData, setFormData] = useState<PurchaseFormData>({
    companyId: '',
    vendorId: '',
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    vendorAddress: '',
    vendorGSTIN: '',
    dueDate: '',
    items: [],
    subtotal: 0,
    taxAmount: 0,
    totalDiscount: 0,
    totalAmount: 0,
    paymentMethod: 'Cash',
    notes: ''
  });

  useEffect(() => {
    fetchCompanies();
    fetchVendors();
    // Set default due date (30 days from now)
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setFormData(prev => ({ 
      ...prev, 
      dueDate: defaultDate.toISOString().split('T')[0] 
    }));
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

  const fetchVendors = async () => {
    try {
      setVendorsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/vendors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Vendors fetched:', data);
        setVendors(data.vendors || data);
      } else {
        console.error('Failed to fetch vendors:', response.status);
        setError('Failed to load vendors');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError('Failed to load vendors');
    } finally {
      setVendorsLoading(false);
    }
  };

  const handleVendorSelect = (vendorId: string) => {
    console.log('Vendor selected:', vendorId);
    console.log('Available vendors:', vendors);
    const vendor = vendors.find(v => v._id === vendorId);
    if (vendor) {
      console.log('Found vendor:', vendor);
      setSelectedVendor(vendor);
      setFormData(prev => ({
        ...prev,
        vendorId: vendor._id,
        vendorName: vendor.name,
        vendorEmail: vendor.email,
        vendorPhone: vendor.phone,
        vendorAddress: vendor.address
      }));
    } else {
      console.error('Vendor not found with ID:', vendorId);
    }
  };

  const calculateTotals = (items: PurchaseItem[]) => {
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

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: string | number) => {
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
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        itemName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxPercent: 0,
        netAmount: 0
      }]
    }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
    calculateTotals(newItems);
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

    // Validate required fields
    if (!formData.companyId) {
      setError('Please select a company');
      setLoading(false);
      return;
    }
    if (!formData.vendorName) {
      setError('Please enter vendor name');
      setLoading(false);
      return;
    }
    if (formData.items.length === 0) {
      setError('Please add at least one item');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Submitting purchase:', formData);
      
      // Filter out empty fields before sending
      const dataToSend = {
        ...formData,
        vendorId: formData.vendorId || undefined,
        vendorEmail: safeTrim(formData.vendorEmail),
        vendorPhone: safeTrim(formData.vendorPhone),
        vendorAddress: safeTrim(formData.vendorAddress),
        vendorGSTIN: safeTrim(formData.vendorGSTIN),
        notes: safeTrim(formData.notes)
      };

      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/purchases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('Purchase response:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('Purchase created:', result);
        navigate('/purchases');
      } else {
        const errorData = await response.json();
        console.error('Purchase creation failed:', errorData);
        setError(errorData.message || 'Failed to create purchase');
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/purchases')}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Purchases
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create Purchase</h1>
          <p className="mt-2 text-gray-600">Record a purchase transaction from a vendor</p>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company & Vendor Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Vendor Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Vendor Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="vendor">Select Vendor *</Label>
                    <Select 
                      value={formData.vendorId} 
                      onValueChange={handleVendorSelect}
                      disabled={vendorsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          vendorsLoading 
                            ? "Loading vendors..." 
                            : vendors.length === 0 
                              ? "No vendors available" 
                              : "Select vendor"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {vendorsLoading ? (
                          <div className="px-2 py-1.5 text-sm text-gray-500">
                            Loading vendors...
                          </div>
                        ) : vendors.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-gray-500">
                            No vendors available
                          </div>
                        ) : (
                          vendors.map((vendor) => (
                            <SelectItem key={vendor._id} value={vendor._id}>
                              {vendor.name} - {vendor.email}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {vendorsLoading && (
                      <p className="text-sm text-gray-500 mt-1">Loading vendors...</p>
                    )}
                  </div>

                  {selectedVendor && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Selected:</strong> {selectedVendor.name}
                      </p>
                      <p className="text-xs text-green-600">{selectedVendor.email}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendorName">Vendor Name *</Label>
                      <Input
                        id="vendorName"
                        value={formData.vendorName}
                        onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="vendorEmail">Vendor Email</Label>
                      <Input
                        id="vendorEmail"
                        type="email"
                        value={formData.vendorEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, vendorEmail: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vendorPhone">Vendor Phone</Label>
                      <Input
                        id="vendorPhone"
                        value={formData.vendorPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, vendorPhone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vendorGSTIN">Vendor GSTIN</Label>
                      <Input
                        id="vendorGSTIN"
                        value={formData.vendorGSTIN}
                        onChange={(e) => setFormData(prev => ({ ...prev, vendorGSTIN: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
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
                  </div>
                  <div>
                    <Label htmlFor="vendorAddress">Vendor Address</Label>
                    <Textarea
                      id="vendorAddress"
                      value={formData.vendorAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendorAddress: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Purchase Items
                </span>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No items added yet. Click "Add Item" to start building your purchase.</p>
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
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Net Amount: ₹{item.netAmount.toFixed(2)}
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
                Purchase Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{formData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Discount:</span>
                    <span>-₹{formData.totalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Amount:</span>
                    <span>₹{formData.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span>₹{formData.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes for this purchase..."
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
              onClick={() => navigate('/purchases')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Purchase'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreatePurchase;
