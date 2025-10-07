
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { env } from '@/config/env';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loginData, setLoginData] = useState<{
    accessToken: string;
    refreshToken: string;
    username: string;
    roles: string[];
    accountId: number;
    expiresIn: number;
  } | null>(null);
  const { login, isLoading, completeEmailConfirmation, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const wsClientRef = useRef<Client | null>(null);
  const loginDataRef = useRef<typeof loginData>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    let isValid = true;
    
    setUsernameError('');
    setPasswordError('');
    
    if (!username.trim()) {
      setUsernameError('Vui lòng nhập tên đăng nhập');
      isValid = false;
    }
    
    if (!password.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    }
    
    return isValid;
  };

  // Kết nối WebSocket để nhận login confirmation
  const connectWebSocket = (token: string) => {
    const socket = new SockJS(`${env.wsUrl}/ws`);

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        'Authorization': `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP:', str);
      },
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      console.log('WebSocket connected for login confirmation');

      // Subscribe to login confirmation endpoint
      client.subscribe('/user/queue/login-confirmed', (message) => {
        console.log('Received login confirmation:', message.body);

        // Parse message and complete login
        try {
          const confirmMessage = JSON.parse(message.body);

          // Đóng WebSocket
          client.deactivate();

          // Complete login using saved data
          const currentLoginData = loginDataRef.current;
          console.log('🔍 loginData from ref:', currentLoginData);
          if (currentLoginData) {
            console.log('✅ Completing email confirmation and navigating...');
            completeEmailConfirmation(
              currentLoginData.accessToken,
              currentLoginData.refreshToken,
              {
                userId: currentLoginData.accountId,
                username: currentLoginData.username,
                roles: currentLoginData.roles
              },
              currentLoginData.expiresIn
            );

            // Navigate to home
            navigate('/');
          } else {
            console.error('❌ loginData is null - cannot complete login');
          }
        } catch (error) {
          console.error('Error parsing login confirmation:', error);
          setOtpError('Lỗi xác thực. Vui lòng thử lại.');
        }
      }, {
        'Authorization': `Bearer ${token}`
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      setOtpError('Lỗi kết nối. Vui lòng thử lại.');
    };

    client.activate();
    wsClientRef.current = client;
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.deactivate();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(username, password);
      console.log('🔐 Login result:', result);

      if (result.success) {
        if (result.requiresEmailConfirmation) {
          console.log('📧 Requires email confirmation - waiting for WebSocket message');

          // Lưu tất cả dữ liệu đăng nhập
          const savedLoginData = {
            accessToken: result.accessToken || '',
            refreshToken: result.refreshToken || '',
            username: result.username || username,
            roles: result.roles || [],
            accountId: result.accountId || 0,
            expiresIn: result.expiresIn || 1800
          };
          setLoginData(savedLoginData);
          loginDataRef.current = savedLoginData;

          // Hiển thị trạng thái chờ xác nhận
          setShowOtpInput(true);
          setUserEmail(result.email || '');

          // Kết nối WebSocket để nhận confirmation
          if (result.accessToken) {
            connectWebSocket(result.accessToken);
          }
        } else {
          // Đăng nhập thành công, không cần OTP
          console.log('✅ Login successful - no email confirmation required');
          navigate('/');
        }
      } else {
        console.log('❌ Login failed:', result.errorMessage);
        setError(result.errorMessage || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Lỗi không xác định. Vui lòng thử lại.');
    }
  };

  const handleCancelConfirmation = () => {
    // Đóng WebSocket
    if (wsClientRef.current) {
      wsClientRef.current.deactivate();
    }

    // Reset states
    setShowOtpInput(false);
    setUserEmail('');
    setLoginData(null);
    loginDataRef.current = null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              {showOtpInput ? (
                <ShieldCheck className="h-6 w-6 text-white" />
              ) : (
                <LogIn className="h-6 w-6 text-white" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {showOtpInput ? 'Xác thực Email' : 'DistributeX Admin'}
          </CardTitle>
          <CardDescription>
            {showOtpInput
              ? `Mã xác nhận đã được gửi đến ${userEmail}`
              : 'Đăng nhập để truy cập hệ thống quản lý'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showOtpInput ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                  <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Đang chờ xác nhận từ email...
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Vui lòng kiểm tra email và nhấn vào liên kết xác nhận
                </p>
              </div>

              {otpError && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm justify-center">
                  <AlertCircle className="h-4 w-4" />
                  {otpError}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleCancelConfirmation}
              >
                Hủy
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (usernameError) setUsernameError('');
                }}
                disabled={isLoading}
                className={usernameError ? 'border-red-500' : ''}
              />
              {usernameError && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {usernameError}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                disabled={isLoading}
                className={passwordError ? 'border-red-500' : ''}
              />
              {passwordError && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {passwordError}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
