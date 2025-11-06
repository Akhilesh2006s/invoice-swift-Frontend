import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Star } from 'lucide-react';

interface CompanyProfile {
  _id?: string;
  businessName: string;
  companyLogo: string;
  companyCountry: string;
  organisationName: string;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  gstIn: string;
  companyAddress: string;
  pincode: string;
  isDefault: boolean;
}

interface CompanyProfileFormProps {
  onSave?: () => void;
}

const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({ onSave }) => {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [formData, setFormData] = useState<CompanyProfile>({
    businessName: '',
    companyLogo: '',
    companyCountry: '',
    organisationName: '',
    companyName: '',
    companyPhone: '',
    companyEmail: '',
    gstIn: '',
    companyAddress: '',
    pincode: '',
    isDefault: false
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/company', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const companies = await response.json();
        setCompanies(companies);
      }
    } catch (error) {
      console.error('Error fetching company profiles:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isDefault: checked
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      
      // If there's a logo file, convert it to base64
      let logoData = formData.companyLogo;
      if (logoFile) {
        logoData = logoPreview;
      }

      const url = editingId 
        ? `https://invoice-swift-backend-production.up.railway.app/api/company/${editingId}`
        : 'https://invoice-swift-backend-production.up.railway.app/api/company';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          companyLogo: logoData
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setLogoFile(null);
        setFormData({
          businessName: '',
          companyLogo: '',
          companyCountry: '',
          organisationName: '',
          companyName: '',
          companyPhone: '',
          companyEmail: '',
          gstIn: '',
          companyAddress: '',
          pincode: '',
          isDefault: false
        });
        setEditingId(null);
        fetchCompanyProfile();
        if (onSave) {
          onSave();
        }
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving the company profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: CompanyProfile) => {
    setFormData(company);
    setEditingId(company._id!);
    if (company.companyLogo) {
      setLogoPreview(company.companyLogo);
    }
  };

  const handleCancel = () => {
    setFormData({
      businessName: '',
      companyLogo: '',
      companyCountry: '',
      organisationName: '',
      companyName: '',
      companyPhone: '',
      companyEmail: '',
      gstIn: '',
      companyAddress: '',
      pincode: '',
      isDefault: false
    });
    setEditingId(null);
    setLogoFile(null);
    setLogoPreview('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company profile?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/company/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Company profile deleted successfully' });
        fetchCompanyProfile();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while deleting the company profile' });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/company/${id}/set-default`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Default company updated successfully' });
        fetchCompanyProfile();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while setting default company' });
    }
  };

  return (
    <div className="space-y-6">
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Company Profile</CardTitle>
        <p className="text-gray-600">Manage your business information and company details</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
              {message.text}
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter your business name"
                required
              />
            </div>

            {/* Organisation Name */}
            <div className="space-y-2">
              <Label htmlFor="organisationName">Organisation Name *</Label>
              <Input
                id="organisationName"
                name="organisationName"
                value={formData.organisationName}
                onChange={handleInputChange}
                placeholder="Enter organisation name"
                required
              />
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter company name"
                required
              />
            </div>

            {/* Company Country */}
            <div className="space-y-2">
              <Label htmlFor="companyCountry">Company Country *</Label>
              <Input
                id="companyCountry"
                name="companyCountry"
                value={formData.companyCountry}
                onChange={handleInputChange}
                placeholder="Enter country"
                required
              />
            </div>

            {/* Company Phone */}
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Company Phone *</Label>
              <Input
                id="companyPhone"
                name="companyPhone"
                type="tel"
                value={formData.companyPhone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            {/* Company Email */}
            <div className="space-y-2">
              <Label htmlFor="companyEmail">Company Email *</Label>
              <Input
                id="companyEmail"
                name="companyEmail"
                type="email"
                value={formData.companyEmail}
                onChange={handleInputChange}
                placeholder="Enter company email"
                required
              />
            </div>

            {/* GST IN */}
            <div className="space-y-2">
              <Label htmlFor="gstIn">GST IN</Label>
              <Input
                id="gstIn"
                name="gstIn"
                value={formData.gstIn}
                onChange={handleInputChange}
                placeholder="Enter GST IN (optional)"
              />
            </div>

            {/* Pincode */}
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="Enter pincode"
                required
              />
            </div>
          </div>

          {/* Company Address */}
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Company Address *</Label>
            <textarea
              id="companyAddress"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleInputChange}
              placeholder="Enter complete company address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          {/* Company Logo */}
          <div className="space-y-2">
            <Label htmlFor="companyLogo">Company Logo</Label>
            <div className="flex items-center space-x-4">
              <Input
                id="companyLogo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="flex-1"
              />
              {logoPreview && (
                <div className="w-20 h-20 border rounded-lg overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">Upload your company logo (JPG, PNG, GIF)</p>
          </div>

          {/* Default Company */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="isDefault">Set as default company</Label>
          </div>

          <div className="flex justify-end space-x-2">
            {editingId && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="px-8 py-2"
            >
              {loading ? 'Saving...' : editingId ? 'Update Company Profile' : 'Save Company Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    {/* Companies List */}
    {companies.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle>Company Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companies.map((company) => (
              <div key={company._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {company.companyLogo && (
                        <img 
                          src={company.companyLogo} 
                          alt="Company Logo" 
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{company.businessName}</h3>
                          {company.isDefault && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          {company.isDefault && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {company.organisationName} | {company.companyName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {company.companyCountry} | {company.companyPhone}
                        </p>
                        <p className="text-sm text-gray-600">
                          {company.companyAddress}, {company.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!company.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(company._id!)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(company)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(company._id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
  );
};

export default CompanyProfileForm;
