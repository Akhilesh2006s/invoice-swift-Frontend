import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StockOperationModal from '@/components/StockOperationModal';
import { 
  Search, 
  Filter, 
  Package,
  AlertCircle,
  FileText,
  Edit,
  Plus,
  Minus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';
import { viewPDF } from '@/utils/pdfGenerator';

interface InventoryItem {
  _id: string;
  itemId: {
    _id: string;
    itemName: string;
    description: string;
    itemType: string;
    sellingPrice: number;
    primaryUnit: string;
  };
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  unit: string;
  lastUpdated: string;
  movements: Array<{
    movementType: string;
    quantity: number;
    referenceType: string;
    reason: string;
    notes: string;
    createdAt: string;
  }>;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalStock: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [selectedItemForOperation, setSelectedItemForOperation] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
    fetchStats();
  }, [searchQuery, lowStockFilter, currentPage]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchQuery,
        lowStock: lowStockFilter === 'low' ? 'true' : 'false'
      });

      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/inventory?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory);
        setTotalPages(data.pagination.pages);
      } else {
        setError('Failed to fetch inventory');
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
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/inventory/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    } else if (item.currentStock <= item.reorderPoint) {
      return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    } else if (item.currentStock >= item.maximumStock) {
      return { status: 'Overstocked', color: 'bg-blue-100 text-blue-800' };
    } else {
      return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleStockIn = (itemId: string) => {
    setSelectedItemForOperation(itemId);
    setShowStockInModal(true);
  };

  const handleStockOut = (itemId: string) => {
    setSelectedItemForOperation(itemId);
    setShowStockOutModal(true);
  };

  const handleModalClose = () => {
    setSelectedItemForOperation(null);
    setShowStockInModal(false);
    setShowStockOutModal(false);
  };

  const handleViewItem = (item: InventoryItem) => {
    const pdfData = {
      title: 'Inventory Item Details',
      number: item.itemId.itemName.replace(/\s+/g, '-').toUpperCase(),
      date: new Date().toLocaleDateString('en-IN'),
      companyName: 'Your Company Name',
      itemName: item.itemId.itemName,
      description: item.itemId.description,
      itemType: item.itemId.itemType,
      currentStock: item.currentStock,
      availableStock: item.availableStock,
      reservedStock: item.reservedStock,
      minimumStock: item.minimumStock,
      maximumStock: item.maximumStock,
      reorderPoint: item.reorderPoint,
      unit: item.unit,
      sellingPrice: item.itemId.sellingPrice,
      stockValue: item.currentStock * item.itemId.sellingPrice,
      lastUpdated: new Date(item.lastUpdated).toLocaleDateString('en-IN'),
      status: getStockStatus(item).status
    };
    
    viewPDF(pdfData, 'inventory');
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="mt-2 text-gray-600">Track stock levels and manage inventory</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowStockInModal(true)}
              >
                <Plus className="w-4 h-4" />
                Stock In
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowStockOutModal(true)}
              >
                <Minus className="w-4 h-4" />
                Stock Out
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Bulk Edit
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalItems}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Stock</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalStock}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Low Stock</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search inventory..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Status
                  </label>
                  <Select value={lowStockFilter} onValueChange={setLowStockFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Items" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="out">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
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

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : inventory.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No inventory items found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Item</th>
                        <th className="text-left py-3 px-4">Current Stock</th>
                        <th className="text-left py-3 px-4">Available</th>
                        <th className="text-left py-3 px-4">Reorder Point</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Value</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item) => {
                        const stockStatus = getStockStatus(item);
                        const stockValue = item.currentStock * item.itemId.sellingPrice;
                        
                        return (
                          <tr key={item._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{item.itemId.itemName}</p>
                                <p className="text-sm text-gray-500">{item.itemId.description}</p>
                                <p className="text-xs text-gray-400">{item.itemId.itemType}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-lg">{item.currentStock}</p>
                                <p className="text-sm text-gray-500">{item.unit}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{item.availableStock}</p>
                                <p className="text-sm text-gray-500">
                                  Reserved: {item.reservedStock}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{item.reorderPoint}</p>
                                <p className="text-sm text-gray-500">
                                  Max: {item.maximumStock}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={stockStatus.color}>
                                {stockStatus.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{formatAmount(stockValue)}</p>
                                <p className="text-sm text-gray-500">
                                  @ {formatAmount(item.itemId.sellingPrice)}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStockIn(item.itemId._id)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Add Stock"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStockOut(item.itemId._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Remove Stock"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleViewItem(item)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="View as PDF"
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" title="Edit Item">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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

        {/* Stock Operation Modals */}
        <StockOperationModal
          isOpen={showStockInModal}
          onClose={handleModalClose}
          operation="stock_in"
          selectedItemId={selectedItemForOperation}
          onSuccess={() => {
            fetchInventory();
            fetchStats();
          }}
        />
        <StockOperationModal
          isOpen={showStockOutModal}
          onClose={handleModalClose}
          operation="stock_out"
          selectedItemId={selectedItemForOperation}
          onSuccess={() => {
            fetchInventory();
            fetchStats();
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
