import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FirebaseTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testSignup = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setMessage(`✅ Signup successful! User ID: ${userCredential.user.uid}`);
    } catch (error: any) {
      setMessage(`❌ Signup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setMessage(`✅ Login successful! User ID: ${userCredential.user.uid}`);
    } catch (error: any) {
      setMessage(`❌ Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Firebase Test (Email/Password)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password123"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={testSignup} disabled={loading || !email || !password}>
            Test Signup
          </Button>
          <Button onClick={testLogin} disabled={loading || !email || !password} variant="outline">
            Test Login
          </Button>
        </div>

        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default FirebaseTest;







