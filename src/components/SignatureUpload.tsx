import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Upload, X, FileImage } from 'lucide-react';

interface SignatureUploadProps {
  onSave?: () => void;
}

const SignatureUpload: React.FC<SignatureUploadProps> = ({ onSave }) => {
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSignature();
  }, []);

  const fetchSignature = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/user/signature', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.signature) {
          setSignaturePreview(data.signature);
        }
      }
    } catch (error) {
      console.error('Error fetching signature:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file (JPG, PNG, etc.)' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }

      setSignatureFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSignaturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setMessage(null);
    }
  };

  const handleRemove = () => {
    setSignatureFile(null);
    setSignaturePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!signatureFile && !signaturePreview) {
        setMessage({ type: 'error', text: 'Please select a signature file' });
        setLoading(false);
        return;
      }

      // If there's a new file, convert it to base64
      let signatureData = signaturePreview;
      if (signatureFile) {
        signatureData = signaturePreview;
      }

      const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/user/signature', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signature: signatureData
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setSignatureFile(null);
        if (onSave) {
          onSave();
        }
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving the signature' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileImage className="w-5 h-5 mr-2" />
          Digital Signature
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload your digital signature for use in documents and invoices
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
              {message.text}
            </Alert>
          )}

          {/* File Upload */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="signature-upload"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="signature-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {signaturePreview ? 'Change Signature' : 'Upload Signature'}
                </p>
                <p className="text-sm text-gray-600">
                  Click to select a JPG or PNG file (max 5MB)
                </p>
              </label>
            </div>

            {/* Signature Preview */}
            {signaturePreview && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Signature Preview</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemove}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img
                    src={signaturePreview}
                    alt="Signature preview"
                    className="max-h-32 mx-auto"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Upload a clear image of your signature</li>
              <li>• Supported formats: JPG, PNG</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Use a white or transparent background for best results</li>
              <li>• Your signature will be used in generated documents</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !signaturePreview}>
              {loading ? 'Saving...' : 'Save Signature'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignatureUpload;


