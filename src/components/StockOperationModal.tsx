import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  X, 
  Plus, 
  Minus, 
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Item {
  _id: string;
  itemName: string;
  description: string;
  itemType: string;
  sellingPrice: number;
  primaryUnit: string;
}

interface StockOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: 'stock_in' | 'stock_out';
  selectedItemId?: string | null;
  onSuccess: () => void;
}

const StockOperationModal: React.FC<StockOperationModalProps> = ({ 
  isOpen, 
  onClose, 
  operation, 
  selectedItemId,
  onSuccess 
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedItemId && items.length > 0) {
      setSelectedItem(selectedItemId);
    }
  }, [selectedItemId, items]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/items', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const endpoint = operation === 'stock_in' ? 'stock-in' : 'stock-out';
      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/inventory/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemId: selectedItem,
          quantity: quantity,
          reason: reason,
          notes: notes
        })
      });

      if (response.ok) {
        setSuccess(`${operation === 'stock_in' ? 'Stock added' : 'Stock removed'} successfully!`);
        setTimeout(() => {
          onSuccess();
          onClose();
          resetForm();
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Operation failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedItem('');
    setQuantity(0);
    setReason('');
    setNotes('');
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const isStockIn = operation === 'stock_in';
  const selectedItemData = items.find(item => item._id === selectedItem);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {isStockIn ? (
                <Plus className="w-5 h-5 text-green-600" />
              ) : (
                <Minus className="w-5 h-5 text-red-600" />
              )}
              {isStockIn ? 'Stock In' : 'Stock Out'}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Selection */}
            <div>
              <Label htmlFor="item">Select Item *</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <div>
                          <p className="font-medium">{item.itemName}</p>
                          <p className="text-sm text-gray-500">{item.itemType}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Item Details */}
            {selectedItemData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Item Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="font-medium">{selectedItemData.itemName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Type:</p>
                    <p className="font-medium">{selectedItemData.itemType}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Unit:</p>
                    <p className="font-medium">{selectedItemData.primaryUnit}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Price:</p>
                    <p className="font-medium">₹{selectedItemData.sellingPrice}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                min="1"
                required
                placeholder={`Enter quantity to ${isStockIn ? 'add' : 'remove'}`}
              />
            </div>

            {/* Reason */}
            <div>
              <Label htmlFor="reason">Reason *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {isStockIn ? (
                    <>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="return">Return</SelectItem>
                      <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                      <SelectItem value="transfer">Transfer In</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="damage">Damage</SelectItem>
                      <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                      <SelectItem value="transfer">Transfer Out</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes (optional)"
                rows={3}
              />
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Display */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !selectedItem || quantity <= 0 || !reason}
                className={isStockIn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {loading ? 'Processing...' : `${isStockIn ? 'Add Stock' : 'Remove Stock'}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockOperationModal;
