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
  FileText
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

interface PurchaseOrderItem {
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxPercent: number;
  netAmount: number;
}

interface FormData {
  companyId: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  vendorAddress: string;
  vendorGSTIN: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  totalDiscount: number;
  totalAmount: number;
  status: string;
  terms: string;
  notes: string;
}

const CreatePurchaseOrder: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [vendorsLoading, setVendorsLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    companyId: '',
    vendorId: '',
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    vendorAddress: '',
    vendorGSTIN: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    items: [],
    subtotal: 0,
    taxAmount: 0,
    totalDiscount: 0,
    totalAmount: 0,
    status: 'draft',
    terms: '',
    notes: ''
  });

  useEffect(() => {
    fetchCompanies();
    fetchVendors();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/company', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        console.error('Failed to fetch companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      } else {
        console.error('Failed to fetch vendors');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setVendorsLoading(false);
    }
  };

  const handleVendorSelect = (vendorId: string) => {
    const vendor = vendors.find(v => v._id === vendorId);
    if (vendor) {
      setFormData(prev => ({
        ...prev,
        vendorId,
        vendorName: vendor.name,
        vendorEmail: vendor.email || '',
        vendorPhone: vendor.phone || '',
        vendorAddress: vendor.address || ''
      }));
    }
  };

  const addItem = () => {
    const newItem: PurchaseOrderItem = {
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

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate net amount for this item
    const item = newItems[index];
    const discountAmount = (item.quantity * item.unitPrice * item.discount) / 100;
    const taxableAmount = (item.quantity * item.unitPrice) - discountAmount;
    const taxAmount = (taxableAmount * item.taxPercent) / 100;
    item.netAmount = taxableAmount + taxAmount;
    
    setFormData(prev => ({ ...prev, items: newItems }));
    calculateTotals(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
    calculateTotals(newItems);
  };

  const calculateTotals = (items: PurchaseOrderItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalDiscount = items.reduce((sum, item) => {
      const discountAmount = (item.quantity * item.unitPrice * item.discount) / 100;
      return sum + discountAmount;
    }, 0);
    const taxAmount = items.reduce((sum, item) => {
      const discountAmount = (item.quantity * item.unitPrice * item.discount) / 100;
      const taxableAmount = (item.quantity * item.unitPrice) - discountAmount;
      return sum + (taxableAmount * item.taxPercent) / 100;
    }, 0);
    const totalAmount = subtotal - totalDiscount + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      totalDiscount,
      totalAmount
    }));
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
    if (!formData.expectedDeliveryDate) {
      setError('Please select expected delivery date');
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
      console.log('Submitting purchase order:', formData);
      
      // Filter out empty fields before sending
      const dataToSend = {
        ...formData,
        vendorId: formData.vendorId || undefined,
        vendorEmail: safeTrim(formData.vendorEmail),
        vendorPhone: safeTrim(formData.vendorPhone),
        vendorAddress: safeTrim(formData.vendorAddress),
        vendorGSTIN: safeTrim(formData.vendorGSTIN),
        terms: safeTrim(formData.terms),
        notes: safeTrim(formData.notes)
      };

      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/purchase-orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Purchase order created successfully:', result);
        navigate('/purchase-orders');
      } else {
        const errorData = await response.json();
        console.error('Purchase order creation failed:', errorData);
        setError(errorData.message || 'Failed to create purchase order');
      }
    } catch (error) {
      console.error('Network error:', error);
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
            size="sm"
            onClick={() => navigate('/purchase-orders')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Purchase Order</h1>
            <p className="text-sm text-gray-600">Create a new purchase order for your business</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Company Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Select 
                    value={formData.companyId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, companyId: value }))}
                    disabled={companiesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        companiesLoading 
                          ? "Loading companies..." 
                          : companies.length === 0 
                            ? "No companies available" 
                            : "Select company"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {companiesLoading ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          Loading companies...
                        </div>
                      ) : companies.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          No companies available
                        </div>
                      ) : (
                        companies.map((company) => (
                          <SelectItem key={company._id} value={company._id}>
                            {company.businessName || company.companyName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Vendor Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
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
                </div>

                <div>
                  <Label htmlFor="vendorName">Vendor Name *</Label>
                  <Input
                    id="vendorName"
                    value={formData.vendorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                    placeholder="Enter vendor name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vendorEmail">Email</Label>
                    <Input
                      id="vendorEmail"
                      type="email"
                      value={formData.vendorEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendorEmail: e.target.value }))}
                      placeholder="vendor@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendorPhone">Phone</Label>
                    <Input
                      id="vendorPhone"
                      value={formData.vendorPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendorPhone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="vendorAddress">Address</Label>
                  <Textarea
                    id="vendorAddress"
                    value={formData.vendorAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendorAddress: e.target.value }))}
                    placeholder="Enter vendor address"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="vendorGSTIN">GSTIN</Label>
                  <Input
                    id="vendorGSTIN"
                    value={formData.vendorGSTIN}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendorGSTIN: e.target.value }))}
                    placeholder="Enter GSTIN number"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Order Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderDate">Order Date</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expectedDeliveryDate">Expected Delivery Date *</Label>
                  <Input
                    id="expectedDeliveryDate"
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="partially_received">Partially Received</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Items</span>
                </CardTitle>
                <Button type="button" onClick={addItem} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items added yet</p>
                  <p className="text-sm">Click "Add Item" to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`itemName-${index}`}>Item Name *</Label>
                          <Input
                            id={`itemName-${index}`}
                            value={item.itemName}
                            onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                            placeholder="Enter item name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`description-${index}`}>Description</Label>
                          <Input
                            id={`description-${index}`}
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            placeholder="Enter item description"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min="0"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`unitPrice-${index}`}>Unit Price *</Label>
                          <Input
                            id={`unitPrice-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`discount-${index}`}>Discount %</Label>
                          <Input
                            id={`discount-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`taxPercent-${index}`}>Tax %</Label>
                          <Input
                            id={`taxPercent-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.taxPercent}
                            onChange={(e) => updateItem(index, 'taxPercent', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <div className="text-right">
                          <Label className="text-sm text-gray-600">Net Amount</Label>
                          <p className="text-lg font-semibold">
                            ${(item.netAmount || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          {formData.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${(formData.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Discount:</span>
                    <span>-${(formData.totalDiscount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Amount:</span>
                    <span>${(formData.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total Amount:</span>
                    <span>${(formData.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms and Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Enter terms and conditions"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter any additional notes"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/purchase-orders')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreatePurchaseOrder;
