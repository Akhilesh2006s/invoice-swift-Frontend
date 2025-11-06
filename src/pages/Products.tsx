import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BulkUpload from '@/components/BulkUpload';
import { 
  Plus, 
  Search, 
  Filter, 
  Package,
  FileText,
  AlertCircle,
  Edit,
  Trash2,
  Upload,
  Download,
  RefreshCw
} from 'lucide-react';
import { viewPDF } from '@/utils/pdfGenerator';

interface Product {
  _id: string;
  itemName: string;
  description: string;
  itemType: string;
  basePrice: number;
  sellingPrice: number;
  taxPercent: number;
  isTaxIncluded: boolean;
  primaryUnit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const Products: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalServices: 0,
    activeItems: 0,
    inactiveItems: 0
  });
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const itemTypes = ['Product', 'Service', 'Consultation', 'Other'];

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, [searchQuery, typeFilter, statusFilter, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchQuery,
        itemType: typeFilter === 'all' ? '' : typeFilter,
        isActive: statusFilter === 'all' ? '' : (statusFilter === 'active' ? 'true' : 'false')
      });

      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/items?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.items);
        setTotalPages(data.pagination.pages);
      } else {
        setError('Failed to fetch products');
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
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/items/stats', {
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

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/items/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchProducts();
        fetchStats();
      } else {
        setError('Failed to delete item');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleEdit = (productId: string) => {
    navigate(`/products/edit/${productId}`);
  };

  const handleViewPDF = (product: Product) => {
    const pdfData = {
      title: 'Product Details',
      number: product.itemName.replace(/\s+/g, '-').toUpperCase(),
      date: new Date().toLocaleDateString('en-IN'),
      itemName: product.itemName,
      description: product.description,
      itemType: product.itemType,
      basePrice: product.basePrice,
      sellingPrice: product.sellingPrice,
      taxPercent: product.taxPercent,
      isTaxIncluded: product.isTaxIncluded ? 'Yes' : 'No',
      primaryUnit: product.primaryUnit,
      status: product.isActive ? 'Active' : 'Inactive',
      createdAt: new Date(product.createdAt).toLocaleDateString('en-IN'),
      updatedAt: new Date(product.updatedAt).toLocaleDateString('en-IN')
    };
    
    viewPDF(pdfData, 'product');
  };

  const handleBulkUpload = async (file: File) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/items/bulk-upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        fetchProducts();
        fetchStats();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      throw new Error('Failed to upload file');
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: { [key: string]: string } = {
      'Product': 'bg-blue-100 text-blue-800',
      'Service': 'bg-green-100 text-green-800',
      'Consultation': 'bg-purple-100 text-purple-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge className="bg-green-100 text-green-800">Active</Badge>
      : <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products & Services</h1>
              <p className="mt-2 text-gray-600">Manage your products and services catalog</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowBulkUpload(true)}
              >
                <Upload className="w-4 h-4" />
                Bulk Upload
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Link to="/products/create">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Services</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalServices}</p>
                  </div>
                  <FileText className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Items</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeItems}</p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Inactive Items</p>
                    <p className="text-2xl font-bold text-red-600">{stats.inactiveItems}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {itemTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
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

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Items</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No items found.</p>
                  <Link to="/products/create">
                    <Button className="mt-4">Add Your First Item</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Item Name</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Base Price</th>
                        <th className="text-left py-3 px-4">Selling Price</th>
                        <th className="text-left py-3 px-4">Tax %</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{product.itemName}</p>
                              {product.description && (
                                <p className="text-sm text-gray-500">{product.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getTypeBadge(product.itemType)}>
                              {product.itemType}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">
                              {formatAmount(product.basePrice)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">
                              {formatAmount(product.sellingPrice)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-600">{product.taxPercent}%</span>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(product.isActive)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewPDF(product)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="View as PDF"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEdit(product._id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDelete(product._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
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

        {/* Bulk Upload Modal */}
        <BulkUpload
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          onUpload={handleBulkUpload}
        />
      </div>
    </DashboardLayout>
  );
};

export default Products;
