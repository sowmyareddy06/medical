import { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export function AuthorizeDoctor() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [doctorUsername, setDoctorUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get doctor's wallet address from localStorage (simulated)
  const getDoctorAddress = (username: string): string | null => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const doctor = users.find((u: any) => u.username === username && u.role === 'doctor');
    return doctor ? doctor.walletAddress : null;
  };

  const handleAuthorizeDoctor = async () => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    if (!doctorUsername.trim()) {
      toast({
        title: "Error",
        description: "Please enter a doctor username.",
        variant: "destructive",
      });
      return;
    }

    const doctorAddress = getDoctorAddress(doctorUsername.trim());
    if (!doctorAddress) {
      toast({
        title: "Error",
        description: "Doctor not found or not registered.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signAndSubmitTransaction({
        data: {
          function: "0x1ab9ffc01fd3696f16ec6208173d4a21f978752b68a8f51e3ced73631e4b1f4b::medical_records::authorize_doctor",
          functionArguments: [doctorAddress],
        },
        options: {
          maxGasAmount: 500000,
          gasUnitPrice: 100,
        }
      });
      
      toast({
        title: "Success",
        description: `Doctor ${doctorUsername} has been authorized to access your medical reports.`,
      });
      setDoctorUsername('');
    } catch (error) {
      console.error("Error authorizing doctor:", error);
      toast({
        title: "Error",
        description: "Failed to authorize doctor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authorize Doctor</CardTitle>
        <CardDescription>
          Grant a doctor access to view your medical reports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="doctorUsername">Doctor Username</Label>
          <Input
            id="doctorUsername"
            type="text"
            placeholder="Enter doctor username"
            value={doctorUsername}
            onChange={(e) => setDoctorUsername(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleAuthorizeDoctor}
          disabled={!account || isLoading}
          className="w-full"
        >
          {isLoading ? 'Authorizing...' : 'Authorize Doctor'}
        </Button>

        <div className="text-sm text-gray-600">
          <p>Note: Only authorized doctors can view your medical reports.</p>
          <p>Emergency reports can be accessed by verified doctors even without authorization.</p>
        </div>
      </CardContent>
    </Card>
  );
}
