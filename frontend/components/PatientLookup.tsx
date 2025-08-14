import { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { aptosClient } from '@/utils/aptosClient';

interface MedicalReport {
  report_hash: string;
  emergency_flag: boolean;
}

export function PatientLookup() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [patientUsername, setPatientUsername] = useState('');
  const [patientReports, setPatientReports] = useState<MedicalReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorizationLoading, setIsAuthorizationLoading] = useState(false);

  // Get patient's wallet address from localStorage (simulated)
  const getPatientAddress = (username: string): string | null => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const patient = users.find((u: any) => u.username === username && u.role === 'patient');
    return patient ? patient.walletAddress : null;
  };

  const handleViewReports = async () => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    if (!patientUsername.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a patient username.",
        variant: "destructive",
      });
      return;
    }

    const patientAddress = getPatientAddress(patientUsername.trim());
    if (!patientAddress) {
      toast({
        title: "Error",
        description: "Patient not found or not registered.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await aptosClient().view({
        function: "0x1ab9ffc01fd3696f16ec6208173d4a21f978752b68a8f51e3ced73631e4b1f4b::medical_records::view_reports",
        arguments: [patientAddress],
        type_arguments: [],
      });

      setPatientReports(response[0] as MedicalReport[]);
      toast({
        title: "Success",
        description: `Found ${(response[0] as MedicalReport[]).length} reports for ${patientUsername}`,
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch patient reports. You may not be authorized.",
        variant: "destructive",
      });
      setPatientReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAuthorization = async () => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    if (!patientUsername.trim()) {
      toast({
        title: "Error",
        description: "Please enter a patient username.",
        variant: "destructive",
      });
      return;
    }

    const patientAddress = getPatientAddress(patientUsername.trim());
    if (!patientAddress) {
      toast({
        title: "Error",
        description: "Patient not found or not registered.",
        variant: "destructive",
      });
      return;
    }

    setIsAuthorizationLoading(true);
    try {
      // Note: In a real implementation, this would send a request to the patient
      // For now, we'll show a message about the authorization process
      toast({
        title: "Authorization Request Sent",
        description: `Authorization request sent to ${patientUsername}. They need to approve your access through their dashboard.`,
      });
    } catch (error) {
      console.error("Error requesting authorization:", error);
      toast({
        title: "Error",
        description: "Failed to send authorization request.",
        variant: "destructive",
      });
    } finally {
      setIsAuthorizationLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Lookup</CardTitle>
        <CardDescription>
          Search for a patient and view their medical reports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="patientUsername">Patient Username</Label>
          <Input
            id="patientUsername"
            type="text"
            placeholder="Enter patient username"
            value={patientUsername}
            onChange={(e) => setPatientUsername(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleViewReports}
            disabled={!account || isLoading}
            className="flex-1"
          >
            {isLoading ? 'Loading...' : 'View Reports'}
          </Button>
          <Button 
            onClick={handleRequestAuthorization}
            disabled={!account || isAuthorizationLoading}
            variant="outline"
          >
            {isAuthorizationLoading ? 'Requesting...' : 'Request Access'}
          </Button>
        </div>

        {patientReports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Medical Reports for {patientUsername}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patientReports.map((report, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm break-all">
                        {report.report_hash}
                      </span>
                      {report.emergency_flag && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          Emergency
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {patientReports.length === 0 && patientUsername && (
          <div className="text-center text-gray-500 py-4">
            No reports found or you don't have authorization to view them.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
