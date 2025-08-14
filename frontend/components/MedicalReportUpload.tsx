import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export function MedicalReportUpload() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [reportHash, setReportHash] = useState("");
  const [emergencyFlag, setEmergencyFlag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async () => {
    if (!reportHash || !account) {
      toast({ 
        title: "Error", 
        description: "Please enter a report hash and connect your wallet",
        variant: "destructive" 
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await signAndSubmitTransaction({
        data: {
          function: "0x1ab9ffc01fd3696f16ec6208173d4a21f978752b68a8f51e3ced73631e4b1f4b::medical_records::upload_report",
          functionArguments: [reportHash, emergencyFlag],
        },
        options: {
          maxGasAmount: 500000,
          gasUnitPrice: 100,
        }
      });
      
      toast({ title: "Report uploaded successfully", description: "Your medical report has been securely stored on the blockchain." });
      setReportHash("");
      setEmergencyFlag(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast({ 
        title: "Upload failed", 
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Medical Report</CardTitle>
        <CardDescription>
          Upload encrypted medical report hash to the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reportHash">Encrypted Report Hash</Label>
          <Input
            id="reportHash"
            placeholder="Enter encrypted report hash"
            value={reportHash}
            onChange={e => setReportHash(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            id="emergency"
            type="checkbox"
            checked={emergencyFlag}
            onChange={e => setEmergencyFlag(e.target.checked)}
          />
          <Label htmlFor="emergency">Mark as Emergency Report</Label>
        </div>
        
        <Button 
          onClick={handleUpload} 
          disabled={!reportHash || !account || isLoading}
          className="w-full"
        >
          {isLoading ? 'Uploading...' : !account ? 'Connect Wallet' : 'Upload Report'}
        </Button>
      </CardContent>
    </Card>
  );
}
