import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TestFirebase: React.FC = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testSignup = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setMessage(`✅ Firebase working! User created: ${userCredential.user.uid}`);
    } catch (error: any) {
      setMessage(`❌ Firebase error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setMessage(`✅ Firebase working! User logged in: ${userCredential.user.uid}`);
    } catch (error: any) {
      setMessage(`❌ Firebase error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Firebase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={testSignup} disabled={loading}>
              Test Signup
            </Button>
            <Button onClick={testLogin} disabled={loading} variant="outline">
              Test Login
            </Button>
          </div>

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-600">
            <p><strong>Steps to fix Magic Link:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Go to Firebase Console</li>
              <li>Authentication → Sign-in method</li>
              <li>Enable "Email/Password"</li>
              <li>Check "Email link (passwordless sign-in)"</li>
              <li>Add "localhost" to authorized domains</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestFirebase;







