import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Star } from 'lucide-react';

interface BankAccount {
  _id?: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  upi: string;
  openingBalance: number;
  upiNumber: string;
  notes: string;
  isDefault: boolean;
}

interface BankAccountFormProps {
  onSave?: () => void;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ onSave }) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [formData, setFormData] = useState<BankAccount>({
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    upi: '',
    openingBalance: 0,
    upiNumber: '',
    notes: '',
    isDefault: false
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/bank-accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const accounts = await response.json();
        setBankAccounts(accounts);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'openingBalance' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isDefault: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `https://invoice-swift-backend-production.up.railway.app/api/bank-accounts/${editingId}`
        : 'https://invoice-swift-backend-production.up.railway.app/api/bank-accounts';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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
          accountNumber: '',
          confirmAccountNumber: '',
          ifscCode: '',
          bankName: '',
          branchName: '',
          upi: '',
          openingBalance: 0,
          upiNumber: '',
          notes: '',
          isDefault: false
        });
        setEditingId(null);
        fetchBankAccounts();
        if (onSave) {
          onSave();
        }
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving the bank account' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account: BankAccount) => {
    setFormData(account);
    setEditingId(account._id!);
  };

  const handleCancel = () => {
    setFormData({
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
      upi: '',
      openingBalance: 0,
      upiNumber: '',
      notes: '',
      isDefault: false
    });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/bank-accounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Bank account deleted successfully' });
        fetchBankAccounts();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while deleting the bank account' });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/bank-accounts/${id}/set-default`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Default bank account updated successfully' });
        fetchBankAccounts();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while setting default account' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Bank Account' : 'Add Bank Account'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
                {message.text}
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Number */}
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter account number"
                  required
                />
              </div>

              {/* Confirm Account Number */}
              <div className="space-y-2">
                <Label htmlFor="confirmAccountNumber">Confirm Account Number *</Label>
                <Input
                  id="confirmAccountNumber"
                  name="confirmAccountNumber"
                  value={formData.confirmAccountNumber}
                  onChange={handleInputChange}
                  placeholder="Confirm account number"
                  required
                />
              </div>

              {/* IFSC Code */}
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code *</Label>
                <Input
                  id="ifscCode"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  placeholder="Enter IFSC code"
                  required
                />
              </div>

              {/* Bank Name */}
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Enter bank name"
                  required
                />
              </div>

              {/* Branch Name */}
              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name *</Label>
                <Input
                  id="branchName"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  placeholder="Enter branch name"
                  required
                />
              </div>

              {/* UPI */}
              <div className="space-y-2">
                <Label htmlFor="upi">UPI</Label>
                <Input
                  id="upi"
                  name="upi"
                  value={formData.upi}
                  onChange={handleInputChange}
                  placeholder="Enter UPI ID"
                />
              </div>

              {/* Opening Balance */}
              <div className="space-y-2">
                <Label htmlFor="openingBalance">Opening Balance</Label>
                <Input
                  id="openingBalance"
                  name="openingBalance"
                  type="number"
                  value={formData.openingBalance}
                  onChange={handleInputChange}
                  placeholder="Enter opening balance"
                />
              </div>

              {/* UPI Number */}
              <div className="space-y-2">
                <Label htmlFor="upiNumber">UPI Number</Label>
                <Input
                  id="upiNumber"
                  name="upiNumber"
                  value={formData.upiNumber}
                  onChange={handleInputChange}
                  placeholder="Enter UPI number"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Default Account */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isDefault">Set as default payment account</Label>
            </div>

            <div className="flex justify-end space-x-2">
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Bank Account' : 'Save Bank Account'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bank Accounts List */}
      {bankAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bank Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bankAccounts.map((account) => (
                <div key={account._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{account.bankName}</h3>
                        {account.isDefault && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        {account.isDefault && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Account: {account.accountNumber} | IFSC: {account.ifscCode}
                      </p>
                      <p className="text-sm text-gray-600">
                        Branch: {account.branchName}
                      </p>
                      {account.upi && (
                        <p className="text-sm text-gray-600">UPI: {account.upi}</p>
                      )}
                      {account.openingBalance > 0 && (
                        <p className="text-sm text-gray-600">
                          Opening Balance: ₹{account.openingBalance}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!account.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(account._id!)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(account._id!)}
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

export default BankAccountForm;


