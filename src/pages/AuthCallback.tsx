import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

const AuthCallback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { signInWithEmailLink, isMagicLink } = useFirebaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        const url = window.location.href;
        
        if (!isMagicLink(url)) {
          setMessage('Invalid email link. Please try again.');
          setLoading(false);
          return;
        }

        // Get the email from localStorage
        const email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          setMessage('Email not found. Please try the login process again.');
          setLoading(false);
          return;
        }

        // Sign in with the email link
        const firebaseUser = await signInWithEmailLink(email, url);
        
        // Integrate with backend authentication
        try {
          const response = await fetch('https://invoice-swift-backend-production.up.railway.app/api/auth/firebase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firebaseUid: firebaseUser.user.uid,
              email: firebaseUser.user.email,
              name: firebaseUser.user.displayName || firebaseUser.user.email.split('@')[0],
              photoURL: firebaseUser.user.photoURL || ''
            })
          });

          if (response.ok) {
            const data = await response.json();
            
            // Store backend token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            setMessage('Successfully signed in! Redirecting to dashboard...');
            setSuccess(true);
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            throw new Error('Backend authentication failed');
          }
        } catch (backendError) {
          console.error('Backend integration error:', backendError);
          setMessage('Login successful but backend integration failed. Please try again.');
        }

        } catch (error: any) {
          console.error('Email link sign-in error:', error);
          setMessage(error.message || 'Failed to sign in. Please try again.');
        } finally {
        setLoading(false);
      }
    };

    handleMagicLink();
  }, [signInWithMagicLink, isMagicLink, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verifying Email Login</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center">
          {loading ? (
            <div className="space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Verifying your email link...</p>
            </div>
          ) : (
            <Alert variant={success ? 'default' : 'destructive'}>
              {success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
