import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
// Internal Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { PatientDashboard } from "@/components/PatientDashboard";
import { DoctorDashboard } from "@/components/DoctorDashboard";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

function App() {
  const { connected } = useWallet();
  const [currentUser, setCurrentUser] = useState<{ username: string; role: 'patient' | 'doctor' } | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (username: string, role: 'patient' | 'doctor') => {
    setCurrentUser({ username, role });
  };

  const handleRegister = (username: string, role: 'patient' | 'doctor') => {
    setCurrentUser({ username, role });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowRegister(false);
  };

  return (
    <>
      <Header />
      <div className="flex items-center justify-center flex-col">
        {connected ? (
          <Card>
            <CardContent className="flex flex-col gap-10 pt-6">
              {!currentUser ? (
                <div className="flex items-center justify-center">
                  {showRegister ? (
                    <RegisterForm 
                      onRegister={handleRegister}
                      onSwitchToLogin={() => setShowRegister(false)}
                    />
                  ) : (
                    <LoginForm 
                      onLogin={handleLogin}
                      onSwitchToRegister={() => setShowRegister(true)}
                    />
                  )}
                </div>
              ) : currentUser.role === 'patient' ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Welcome, {currentUser.username}!</h1>
                    <Button onClick={handleLogout} variant="outline">Logout</Button>
                  </div>
                  <PatientDashboard onLogout={handleLogout} username={currentUser.username} />
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Welcome Dr. {currentUser.username}!</h1>
                    <Button onClick={handleLogout} variant="outline">Logout</Button>
                  </div>
                  <DoctorDashboard onLogout={handleLogout} username={currentUser.username} />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <CardHeader>
            <CardTitle>To get started Connect a wallet</CardTitle>
          </CardHeader>
        )}
      </div>
      <Toaster />
    </>
  );
}

export default App;
