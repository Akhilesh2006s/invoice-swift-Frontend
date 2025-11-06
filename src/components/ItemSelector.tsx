import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { 
  Search, 
  Plus, 
  Package, 
  Edit,
  Trash2,
  Check,
  Calculator
} from 'lucide-react';

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

interface ItemSelectorProps {
  onItemSelect: (item: Item) => void;
  onAddItem: (itemData: any) => void;
}

const ItemSelector: React.FC<ItemSelectorProps> = ({ onItemSelect, onAddItem }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    itemType: 'product',
    itemName: '',
    description: '',
    basePrice: 0,
    isTaxIncluded: false,
    sellingPrice: 0,
    taxPercent: 18,
    primaryUnit: 'piece'
  });

  useEffect(() => {
    fetchItems();
  }, [searchTerm]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/items?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setFormData({
          itemType: 'product',
          itemName: '',
          description: '',
          basePrice: 0,
          isTaxIncluded: false,
          sellingPrice: 0,
          taxPercent: 18,
          primaryUnit: 'piece'
        });
        setShowAddForm(false);
        fetchItems();
        onAddItem(data.item);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving the item' });
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (item: Item) => {
    onItemSelect(item);
  };

  const calculateTaxAmount = (price: number, taxPercent: number, isTaxIncluded: boolean) => {
    if (isTaxIncluded) {
      return (price * taxPercent) / (100 + taxPercent);
    } else {
      return (price * taxPercent) / 100;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Search and Add */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
                  {message.text}
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="itemType">Item Type</Label>
                  <select
                    id="itemType"
                    name="itemType"
                    value={formData.itemType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="product">Product</option>
                    <option value="service">Service</option>
                    <option value="consultation">Consultation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleInputChange}
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="basePrice">Base Price *</Label>
                  <Input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Selling Price *</Label>
                  <Input
                    id="sellingPrice"
                    name="sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="taxPercent">Tax Percent</Label>
                  <Input
                    id="taxPercent"
                    name="taxPercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.taxPercent}
                    onChange={handleInputChange}
                    placeholder="18"
                  />
                </div>
                <div>
                  <Label htmlFor="primaryUnit">Primary Unit</Label>
                  <select
                    id="primaryUnit"
                    name="primaryUnit"
                    value={formData.primaryUnit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="piece">Piece</option>
                    <option value="kg">Kilogram</option>
                    <option value="gram">Gram</option>
                    <option value="liter">Liter</option>
                    <option value="meter">Meter</option>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="month">Month</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter item description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isTaxIncluded"
                  name="isTaxIncluded"
                  checked={formData.isTaxIncluded}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <Label htmlFor="isTaxIncluded">Tax included in price</Label>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Price Calculation</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span>{formatCurrency(formData.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selling Price:</span>
                    <span>{formatCurrency(formData.sellingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({formData.taxPercent}%):</span>
                    <span>{formatCurrency(calculateTaxAmount(formData.sellingPrice, formData.taxPercent, formData.isTaxIncluded))}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Final Price:</span>
                    <span>{formatCurrency(formData.isTaxIncluded ? formData.sellingPrice : formData.sellingPrice + calculateTaxAmount(formData.sellingPrice, formData.taxPercent, formData.isTaxIncluded))}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Item'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Item List */}
      <Card>
        <CardHeader>
          <CardTitle>Select Item</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No items found</p>
              <p className="text-sm text-gray-500">Add an item to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="border rounded-lg p-4 cursor-pointer transition-colors hover:border-gray-300 hover:bg-gray-50"
                  onClick={() => handleItemSelect(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{item.itemName}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {item.itemType}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>Base: {formatCurrency(item.basePrice)}</span>
                        <span>Selling: {formatCurrency(item.sellingPrice)}</span>
                        <span>Tax: {item.taxPercent}%</span>
                        <span>Unit: {item.primaryUnit}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(item.isTaxIncluded ? item.sellingPrice : item.sellingPrice + calculateTaxAmount(item.sellingPrice, item.taxPercent, item.isTaxIncluded))}
                      </span>
                      <Check className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemSelector;


