import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

const MagicLinkLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const { sendEmailLink } = useFirebaseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      await sendEmailLink(email.trim());
      setMessage('Check your email! We sent you a secure link to sign in.');
      setMessageType('success');
    } catch (error: any) {
      setMessage(error.message || 'Failed to send email link. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Sign in with Email</CardTitle>
        <p className="text-gray-600 mt-2">
          Enter your email address and we'll send you a secure login link
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={loading}
              className="mt-1"
            />
          </div>

          {message && (
            <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
              {messageType === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Email Link...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Email Link
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            We'll send you a secure link that you can click to sign in instantly.
            No password required!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MagicLinkLogin;
