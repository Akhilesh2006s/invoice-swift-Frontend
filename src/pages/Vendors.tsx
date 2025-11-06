import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BulkUploadModal from '@/components/BulkUploadModal';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  ArrowLeft,
  Save,
  X,
  Upload,
  FileSpreadsheet,
  Download
} from 'lucide-react';

interface Vendor {
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
  gstNumber: string;
  panNumber: string;
  contactPerson: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const Vendors: React.FC = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    },
    gstNumber: '',
    panNumber: '',
    contactPerson: '',
    notes: ''
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/vendors', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVendors(data.vendors);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch vendors' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingVendor 
        ? `https://invoice-swift-backend-production.up.railway.app/api/vendors/${editingVendor._id}`
        : 'https://invoice-swift-backend-production.up.railway.app/api/vendors';
      
      const method = editingVendor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editingVendor ? 'Vendor updated successfully!' : 'Vendor added successfully!' 
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: { street: '', city: '', state: '', pincode: '', country: '' },
          gstNumber: '',
          panNumber: '',
          contactPerson: '',
          notes: ''
        });
        setShowAddForm(false);
        setEditingVendor(null);
        fetchVendors();
      } else {
        setMessage({ type: 'error', text: 'Failed to save vendor' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      gstNumber: vendor.gstNumber,
      panNumber: vendor.panNumber,
      contactPerson: vendor.contactPerson,
      notes: vendor.notes
    });
    setShowAddForm(true);
  };

  const handleDelete = async (vendorId: string) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/vendors/${vendorId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Vendor deleted successfully!' });
        fetchVendors();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete vendor' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/vendors/download', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vendors-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        setMessage({ type: 'success', text: 'Vendors list downloaded successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to download vendors list' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.phone.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
              <p className="mt-2 text-gray-600">Manage your vendor contacts</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <Button onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Add/Edit Vendor Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingVendor ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Vendor Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        value={formData.gstNumber}
                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="panNumber">PAN Number</Label>
                      <Input
                        id="panNumber"
                        value={formData.panNumber}
                        onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Address</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <Input
                        placeholder="Street"
                        value={formData.address.street}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, street: e.target.value }
                        })}
                      />
                      <Input
                        placeholder="City"
                        value={formData.address.city}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, city: e.target.value }
                        })}
                      />
                      <Input
                        placeholder="State"
                        value={formData.address.state}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, state: e.target.value }
                        })}
                      />
                      <Input
                        placeholder="Pincode"
                        value={formData.address.pincode}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, pincode: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about this vendor"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setShowAddForm(false);
                      setEditingVendor(null);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        address: { street: '', city: '', state: '', pincode: '', country: '' },
                        gstNumber: '',
                        panNumber: '',
                        contactPerson: '',
                        notes: ''
                      });
                    }}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingVendor ? 'Update Vendor' : 'Add Vendor'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {message && (
            <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Vendors List */}
          <Card>
            <CardHeader>
              <CardTitle>All Vendors ({filteredVendors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredVendors.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
                  <p className="text-gray-600 mb-6">Add your first vendor to get started</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vendor
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVendors.map((vendor) => (
                    <Card key={vendor._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(vendor)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(vendor._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          {vendor.email && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span>{vendor.email}</span>
                            </div>
                          )}
                          {vendor.phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{vendor.phone}</span>
                            </div>
                          )}
                          {vendor.contactPerson && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Building2 className="w-4 h-4" />
                              <span>{vendor.contactPerson}</span>
                            </div>
                          )}
                          {vendor.address.street && (
                            <div className="flex items-start gap-2 text-gray-600">
                              <MapPin className="w-4 h-4 mt-0.5" />
                              <span>
                                {vendor.address.street}, {vendor.address.city}, {vendor.address.state} {vendor.address.pincode}
                              </span>
                            </div>
                          )}
                          {vendor.gstNumber && (
                            <div className="text-xs text-gray-500">
                              GST: {vendor.gstNumber}
                            </div>
                          )}
                          {vendor.notes && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                {vendor.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bulk Upload Modal */}
          <BulkUploadModal
            isOpen={showBulkUpload}
            onClose={() => setShowBulkUpload(false)}
            type="vendors"
            onSuccess={() => {
              fetchVendors();
              setMessage({ type: 'success', text: 'Vendors uploaded successfully!' });
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Vendors;
