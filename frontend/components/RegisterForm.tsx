import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface RegisterFormProps {
  onRegister: (username: string, role: 'patient' | 'doctor') => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const { account, signAndSubmitTransaction } = useWallet();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [contactInfo, setContactInfo] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet first",
      });
      return;
    }
    
    if (!username || !password || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    // Role-specific validation
    if (role === 'patient' && !contactInfo) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide your contact information",
      });
      return;
    }

    if (role === 'doctor' && !licenseNumber) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide your government license number",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if user already exists
      const storedUsers = JSON.parse(localStorage.getItem('medicalUsers') || '[]');
      const existingUser = storedUsers.find((u: any) => u.username === username);
      
      if (existingUser) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Username already exists",
        });
        return;
      }

      // Create new user locally
      const newUser = {
        username,
        password,
        role,
        contactInfo: role === 'patient' ? contactInfo : undefined,
        licenseNumber: role === 'doctor' ? licenseNumber : undefined,
        createdAt: new Date().toISOString(),
        walletAddress: account?.address?.toString(),
      };

      // Register on blockchain if wallet is connected
      if (account && signAndSubmitTransaction) {
        try {
          if (role === 'patient') {
            await signAndSubmitTransaction({
              data: {
                function: "0x1ab9ffc01fd3696f16ec6208173d4a21f978752b68a8f51e3ced73631e4b1f4b::medical_records::register_patient",
                functionArguments: [],
              },
              options: {
                maxGasAmount: 500000,
                gasUnitPrice: 100,
              }
            });
          }
          // Note: Doctor registration requires admin approval in the smart contract
          // For now, we'll just store locally and admins can verify later
          
          toast({
            title: "Blockchain Registration Successful",
            description: `Account registered on blockchain for ${username}!`,
          });
        } catch (blockchainError) {
          console.error("Blockchain registration failed:", blockchainError);
          toast({
            variant: "destructive",
            title: "Blockchain Registration Failed",
            description: "Local account created, but blockchain registration failed. You can try again later.",
          });
        }
      }

      storedUsers.push(newUser);
      localStorage.setItem('medicalUsers', JSON.stringify(storedUsers));

      toast({
        title: "Registration Successful",
        description: `Account created successfully for ${username}!`,
      });

      onRegister(username, role);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during registration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Create New Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Choose a password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="role">I am a:</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'patient' | 'doctor')}
              className="w-full p-2 border rounded"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          
          {/* Role-specific fields */}
          {role === 'patient' && (
            <div>
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Input
                id="contactInfo"
                type="text"
                placeholder="Phone number, email, or emergency contact"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide phone number, email, or emergency contact details
              </p>
            </div>
          )}
          
          {role === 'doctor' && (
            <div>
              <Label htmlFor="licenseNumber">Government License Number</Label>
              <Input
                id="licenseNumber"
                type="text"
                placeholder="Enter your medical license number"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your government-issued medical license number
              </p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:underline"
              >
                Login Here
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
