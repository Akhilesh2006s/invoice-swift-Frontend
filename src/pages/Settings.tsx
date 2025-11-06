import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Bell, Shield, Palette, Building2, CreditCard, FileImage, Receipt, FileText, Sun, Moon, Monitor, Check } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import CompanyProfileForm from '@/components/CompanyProfileForm';
import BankAccountForm from '@/components/BankAccountForm';
import SignatureUpload from '@/components/SignatureUpload';
import { useTheme } from '@/contexts/ThemeContext';

const Settings: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [user, setUser] = useState<any>(null);
  const { themeMode, setThemeMode } = useTheme();
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('language') || 'English';
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getPageTitle = () => {
    switch (currentPath) {
      case '/settings/profile':
        return 'Profile Settings';
      case '/company-profile':
        return 'Company Profile';
      case '/settings/bank-accounts':
        return 'Bank Accounts';
      case '/settings/signature':
        return 'Digital Signature';
      case '/settings/invoice':
        return 'Invoice Settings';
      case '/settings/notifications':
        return 'Notification Settings';
      case '/settings/security':
        return 'Security Settings';
      case '/settings/appearance':
        return 'Appearance Settings';
      default:
        return 'Settings';
    }
  };

  const getPageIcon = () => {
    switch (currentPath) {
      case '/settings/profile':
        return <User className="w-5 h-5" />;
      case '/company-profile':
        return <Building2 className="w-5 h-5" />;
      case '/settings/bank-accounts':
        return <CreditCard className="w-5 h-5" />;
      case '/settings/signature':
        return <FileImage className="w-5 h-5" />;
      case '/settings/invoice':
        return <Receipt className="w-5 h-5" />;
      case '/settings/notifications':
        return <Bell className="w-5 h-5" />;
      case '/settings/security':
        return <Shield className="w-5 h-5" />;
      case '/settings/appearance':
        return <Palette className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const renderSettingsContent = () => {
    switch (currentPath) {
      case '/settings/profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={user?.firstName || ''} placeholder="Enter your first name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={user?.lastName || ''} placeholder="Enter your last name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ''} placeholder="Enter your email" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Enter your phone number" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        );

      case '/company-profile':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Company Profiles</h2>
                <p className="text-gray-600">Manage your business information and company details</p>
              </div>
              <Button onClick={() => window.location.href = '/company-profile?new=true'}>
                + Add New Company
              </Button>
            </div>
            <CompanyProfileForm />
          </div>
        );

      case '/settings/bank-accounts':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Bank Accounts</h2>
                <p className="text-gray-600">Manage your bank accounts and payment methods</p>
              </div>
              <Button onClick={() => window.location.href = '/settings/bank-accounts?new=true'}>
                + Add New Bank Account
              </Button>
            </div>
            <BankAccountForm />
          </div>
        );

      case '/settings/signature':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Digital Signatures</h2>
                <p className="text-gray-600">Upload and manage your digital signatures</p>
              </div>
              <Button onClick={() => window.location.href = '/settings/signature?new=true'}>
                + Add New Signature
              </Button>
            </div>
            <SignatureUpload />
          </div>
        );

      case '/settings/invoice':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Numbering</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                    <Input id="invoicePrefix" defaultValue="INV" placeholder="INV" />
                    <p className="text-sm text-gray-600 mt-1">Prefix for invoice numbers (e.g., INV-000001)</p>
                  </div>
                  <div>
                    <Label htmlFor="invoiceStartNumber">Starting Number</Label>
                    <Input id="invoiceStartNumber" type="number" defaultValue="1" placeholder="1" />
                    <p className="text-sm text-gray-600 mt-1">Starting number for new invoices</p>
                  </div>
                  <div>
                    <Label htmlFor="invoicePadding">Number Padding</Label>
                    <Input id="invoicePadding" type="number" defaultValue="6" placeholder="6" />
                    <p className="text-sm text-gray-600 mt-1">Number of digits (e.g., 6 = 000001)</p>
                  </div>
                  <div>
                    <Label htmlFor="invoiceFormat">Format Preview</Label>
                    <Input id="invoiceFormat" value="INV-000001" disabled className="bg-gray-50" />
                    <p className="text-sm text-gray-600 mt-1">Preview of invoice number format</p>
                  </div>
                </div>
                <Button>Save Invoice Numbering Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Default Invoice Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                    <Input id="defaultTaxRate" type="number" defaultValue="18" placeholder="18" />
                    <p className="text-sm text-gray-600 mt-1">Default GST/VAT rate for new invoices</p>
                  </div>
                  <div>
                    <Label htmlFor="defaultPaymentTerms">Default Payment Terms (Days)</Label>
                    <Input id="defaultPaymentTerms" type="number" defaultValue="30" placeholder="30" />
                    <p className="text-sm text-gray-600 mt-1">Default number of days until payment is due</p>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <select id="currency" className="w-full mt-2 p-2 border rounded-md" defaultValue="INR">
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                    <p className="text-sm text-gray-600 mt-1">Default currency for invoices</p>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <select id="dateFormat" className="w-full mt-2 p-2 border rounded-md" defaultValue="DD/MM/YYYY">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                    </select>
                    <p className="text-sm text-gray-600 mt-1">Date format for invoices</p>
                  </div>
                </div>
                <Button>Save Default Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="defaultTerms">Default Terms & Conditions</Label>
                  <Textarea
                    id="defaultTerms"
                    rows={6}
                    className="mt-2"
                    placeholder="Enter default terms and conditions that will appear on all invoices..."
                    defaultValue="Payment is due within the specified number of days from the invoice date. Late payments may incur interest charges as per applicable laws."
                  />
                  <p className="text-sm text-gray-600 mt-1">This text will appear on all new invoices by default</p>
                </div>
                <Button>Save Terms & Conditions</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Email Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="emailSubject">Default Email Subject</Label>
                  <Input id="emailSubject" defaultValue="Invoice from {company_name}" placeholder="Invoice from {company_name}" />
                  <p className="text-sm text-gray-600 mt-1">Subject line for invoice emails (use {'{company_name}'} for dynamic values)</p>
                </div>
                <div>
                  <Label htmlFor="emailBody">Default Email Body</Label>
                  <Textarea
                    id="emailBody"
                    rows={6}
                    className="mt-2"
                    placeholder="Enter default email body..."
                    defaultValue="Dear {customer_name},

Please find attached invoice #{invoice_number} for the amount of {amount}.

Payment is due by {due_date}.

Thank you for your business!"
                  />
                  <p className="text-sm text-gray-600 mt-1">Default email body when sending invoices (use {'{variable_name}'} for dynamic values)</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-send Invoice</Label>
                    <p className="text-sm text-gray-600">Automatically send invoice email when marked as sent</p>
                  </div>
                  <Switch />
                </div>
                <Button>Save Email Settings</Button>
              </CardContent>
            </Card>
          </div>
        );

      case '/settings/notifications':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-600">Receive push notifications</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Invoice Reminders</Label>
                  <p className="text-sm text-gray-600">Get reminded about pending invoices</p>
                </div>
                <Switch />
              </div>
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        );

      case '/settings/security':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Change Password</Label>
                <div className="space-y-2 mt-2">
                  <Input type="password" placeholder="Current password" />
                  <Input type="password" placeholder="New password" />
                  <Input type="password" placeholder="Confirm new password" />
                </div>
                <Button className="mt-2">Update Password</Button>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case '/settings/appearance':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-gray-600 mb-2">Choose your preferred theme</p>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Button 
                    variant={themeMode === 'light' ? 'default' : 'outline'} 
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setThemeMode('light')}
                  >
                    <Sun className="w-6 h-6" />
                    <span className="font-medium">Light</span>
                    {themeMode === 'light' && <Check className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant={themeMode === 'dark' ? 'default' : 'outline'} 
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setThemeMode('dark')}
                  >
                    <Moon className="w-6 h-6" />
                    <span className="font-medium">Dark</span>
                    {themeMode === 'dark' && <Check className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant={themeMode === 'system' ? 'default' : 'outline'} 
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setThemeMode('system')}
                  >
                    <Monitor className="w-6 h-6" />
                    <span className="font-medium">System</span>
                    {themeMode === 'system' && <Check className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Current theme: {themeMode === 'system' ? 'Follows system preference' : themeMode}
                </p>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <p className="text-sm text-gray-600 mb-2">Select your preferred language</p>
                <select 
                  id="language"
                  className="w-full mt-2 p-2 border rounded-md"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
              <Button 
                onClick={() => {
                  localStorage.setItem('language', language);
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                }}
              >
                {saved ? '✓ Saved!' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600">Select a settings category from the sidebar</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center">
            {getPageIcon()}
            <h1 className="text-3xl font-bold text-gray-900 ml-3">{getPageTitle()}</h1>
          </div>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        {renderSettingsContent()}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
