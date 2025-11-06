import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Printer } from 'lucide-react';

interface InvoiceItem {
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxPercent: number;
  netAmount: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalDiscount: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  dueDate: string;
  createdAt: string;
}

const InvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://invoice-swift-backend-production.up.railway.app/api/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      } else {
        console.error('Failed to fetch invoice');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Invoice not found</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Invoice */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-0">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
                  <p className="text-blue-100">Invoice #{invoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  {invoice.companyLogo && (
                    <img 
                      src={invoice.companyLogo} 
                      alt="Company Logo" 
                      className="w-20 h-20 object-contain bg-white rounded-lg p-2 mb-4"
                    />
                  )}
                  <h2 className="text-xl font-semibold">{invoice.companyName}</h2>
                </div>
              </div>
            </div>

            {/* Company & Customer Details */}
            <div className="p-8 border-b">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Details */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">From:</h3>
                  <div className="text-gray-600">
                    <p className="font-medium">{invoice.companyName}</p>
                    <p>{invoice.companyAddress}</p>
                    <p>Phone: {invoice.companyPhone}</p>
                    <p>Email: {invoice.companyEmail}</p>
                  </div>
                </div>

                {/* Customer Details */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Bill To:</h3>
                  <div className="text-gray-600">
                    <p className="font-medium">{invoice.customerName}</p>
                    <p>{invoice.customerAddress}</p>
                    <p>Phone: {invoice.customerPhone}</p>
                    <p>Email: {invoice.customerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Info */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Invoice Date</p>
                  <p className="font-medium">{formatDate(invoice.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 border-b font-semibold text-gray-700">Item</th>
                      <th className="text-right py-3 px-4 border-b font-semibold text-gray-700">Qty</th>
                      <th className="text-right py-3 px-4 border-b font-semibold text-gray-700">Rate</th>
                      <th className="text-right py-3 px-4 border-b font-semibold text-gray-700">Discount</th>
                      <th className="text-right py-3 px-4 border-b font-semibold text-gray-700">Tax</th>
                      <th className="text-right py-3 px-4 border-b font-semibold text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{item.itemName}</p>
                            {item.description && (
                              <p className="text-sm text-gray-500">{item.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">{item.quantity}</td>
                        <td className="py-3 px-4 text-right">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">{item.discount}%</td>
                        <td className="py-3 px-4 text-right">{item.taxPercent}%</td>
                        <td className="py-3 px-4 text-right font-medium">₹{item.netAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-8 flex justify-end">
                <div className="w-80">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>₹{invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Discount:</span>
                      <span>-₹{invoice.totalDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax Amount:</span>
                      <span>₹{invoice.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount:</span>
                        <span>₹{invoice.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">{invoice.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 p-6 text-center text-gray-600">
              <p>Thank you for your business!</p>
              <p className="text-sm mt-2">This is a computer generated invoice.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceView;
