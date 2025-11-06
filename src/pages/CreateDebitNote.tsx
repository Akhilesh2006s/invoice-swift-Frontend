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
  FileText,
  RotateCcw
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

interface Purchase {
  _id: string;
  purchaseNumber: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  totalAmount: number;
  purchaseDate: string;
  companyId: {
    businessName: string;
    companyName: string;
  };
}

interface DebitNoteItem {
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
  originalPurchaseId: string;
  originalPurchaseNumber: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  vendorAddress: string;
  debitNoteDate: string;
  reason: string;
  description: string;
  items: DebitNoteItem[];
  subtotal: number;
  taxAmount: number;
  totalDiscount: number;
  totalAmount: number;
  status: string;
  notes: string;
}

const CreateDebitNote: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    companyId: '',
    originalPurchaseId: '',
    originalPurchaseNumber: '',
    vendorId: '',
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    vendorAddress: '',
    debitNoteDate: new Date().toISOString().split('T')[0],
    reason: '',
    description: '',
    items: [],
    subtotal: 0,
    taxAmount: 0,
    totalDiscount: 0,
    totalAmount: 0,
    status: 'draft',
    notes: ''
  });

  useEffect(() => {
    fetchCompanies();
    fetchPurchases();
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

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/purchases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPurchases(data.purchases || data);
      } else {
        console.error('Failed to fetch purchases');
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setPurchasesLoading(false);
    }
  };

  const handlePurchaseSelect = (purchaseId: string) => {
    const purchase = purchases.find(p => p._id === purchaseId);
    if (purchase) {
      setFormData(prev => ({
        ...prev,
        originalPurchaseId: purchaseId,
        originalPurchaseNumber: purchase.purchaseNumber,
        vendorName: purchase.vendorName,
        vendorEmail: purchase.vendorEmail || '',
        vendorPhone: purchase.vendorPhone || '',
        companyId: purchase.companyId._id
      }));
    }
  };

  const addItem = () => {
    const newItem: DebitNoteItem = {
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

  const updateItem = (index: number, field: keyof DebitNoteItem, value: string | number) => {
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

  const calculateTotals = (items: DebitNoteItem[]) => {
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
    if (!formData.originalPurchaseId || !formData.originalPurchaseNumber) {
      setError('Please select an original purchase');
      setLoading(false);
      return;
    }
    if (!formData.vendorName) {
      setError('Please enter vendor name');
      setLoading(false);
      return;
    }
    if (!formData.reason) {
      setError('Please select a reason for the debit note');
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
      console.log('Submitting debit note:', formData);
      
      // Filter out empty fields before sending
      const dataToSend = {
        ...formData,
        vendorId: formData.vendorId || undefined,
        vendorEmail: safeTrim(formData.vendorEmail),
        vendorPhone: safeTrim(formData.vendorPhone),
        vendorAddress: safeTrim(formData.vendorAddress),
        description: safeTrim(formData.description),
        notes: safeTrim(formData.notes)
      };

      console.log('Data being sent to backend:', dataToSend);
      console.log('Required fields check:', {
        companyId: !!dataToSend.companyId,
        originalPurchaseId: !!dataToSend.originalPurchaseId,
        originalPurchaseNumber: !!dataToSend.originalPurchaseNumber,
        vendorName: !!dataToSend.vendorName,
        reason: !!dataToSend.reason,
        items: dataToSend.items.length
      });

      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/debit-notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Debit note created successfully:', result);
        navigate('/debit-notes');
      } else {
        const errorData = await response.json();
        console.error('Debit note creation failed:', errorData);
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
        setError(errorData.message || `Failed to create debit note (Status: ${response.status})`);
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
            onClick={() => navigate('/debit-notes')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Debit Note</h1>
            <p className="text-sm text-gray-600">Create a new debit note for purchase returns or adjustments</p>
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

            {/* Original Purchase Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Original Purchase</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="originalPurchase">Select Original Purchase *</Label>
                  <Select 
                    value={formData.originalPurchaseId} 
                    onValueChange={handlePurchaseSelect}
                    disabled={purchasesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        purchasesLoading 
                          ? "Loading purchases..." 
                          : purchases.length === 0 
                            ? "No purchases available" 
                            : "Select purchase"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {purchasesLoading ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          Loading purchases...
                        </div>
                      ) : purchases.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          No purchases available
                        </div>
                      ) : (
                        purchases
                          .filter(purchase => purchase._id && purchase.purchaseNumber)
                          .map((purchase) => (
                            <SelectItem key={purchase._id} value={purchase._id}>
                              {purchase.purchaseNumber} - {purchase.vendorName}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vendor Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Vendor Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Debit Note Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Debit Note Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="debitNoteDate">Debit Note Date</Label>
                  <Input
                    id="debitNoteDate"
                    type="date"
                    value={formData.debitNoteDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, debitNoteDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason *</Label>
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

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description for the debit note"
                  rows={3}
                />
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
                  <span>Debit Note Summary</span>
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

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
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
              onClick={() => navigate('/debit-notes')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Debit Note'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateDebitNote;
