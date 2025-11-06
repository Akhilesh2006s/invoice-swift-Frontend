import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import CompanyProfileForm from '@/components/CompanyProfileForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CompanyProfile {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

const CompanyProfilePage: React.FC = () => {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/company', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const companyData = await response.json();
        setCompany(companyData);
      } else if (response.status === 404) {
        // No company profile found, show form
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSaved = () => {
    setShowForm(false);
    fetchCompanyProfile(); // Refresh the profile data
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
          <p className="mt-2 text-gray-600">Manage your business information and company details</p>
        </div>

        {showForm ? (
          <CompanyProfileForm onSave={handleProfileSaved} />
        ) : company ? (
          <div className="space-y-6">
            {/* Company Overview Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {company.companyLogo ? (
                      <img 
                        src={company.companyLogo} 
                        alt="Company Logo" 
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-2xl">{company.businessName}</CardTitle>
                      <p className="text-gray-600">{company.organisationName}</p>
                      <p className="text-sm text-gray-500">{company.companyName}</p>
                    </div>
                  </div>
                  <Button onClick={() => setShowForm(true)}>
                    Edit Profile
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Business Name</label>
                    <p className="text-gray-900">{company.businessName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Organisation Name</label>
                    <p className="text-gray-900">{company.organisationName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Company Name</label>
                    <p className="text-gray-900">{company.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Country</label>
                    <p className="text-gray-900">{company.companyCountry}</p>
                  </div>
                  {company.gstIn && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">GST IN</label>
                      <p className="text-gray-900">{company.gstIn}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-gray-900">{company.companyPhone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-gray-900">{company.companyEmail}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-3 text-gray-500 mt-1" />
                    <div>
                      <p className="text-gray-900">{company.companyAddress}</p>
                      <p className="text-gray-600">{company.pincode}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Company Profile</h3>
            <p className="text-gray-600 mb-6">Create your company profile to get started</p>
            <Button onClick={() => setShowForm(true)}>
              Create Company Profile
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyProfilePage;


