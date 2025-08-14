import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MESSAGE_BOARD_ABI } from "@/utils/message_board_abi";
import { surfClient } from "@/utils/surfClient";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "@/components/ui/use-toast";

export default function EmergencyAccess() {
  const { account, connected } = useWallet();
  const [patientAddress, setPatientAddress] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmergencyAccess = async () => {
    if (!patientAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a patient address",
        variant: "destructive"
      });
      return;
    }

    if (!connected || !account?.address) {
      toast({
        title: "Error", 
        description: "Please connect your wallet to access patient reports",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setReports([]);

    const signerAddress = account.address.toString().startsWith("0x")
      ? account.address.toString()
      : `0x${account.address.toString()}`;
    const patientAddr = patientAddress.startsWith("0x")
      ? patientAddress
      : `0x${patientAddress}`;

    try {
      console.log("Attempting emergency access for patient:", patientAddr);
      console.log("Doctor address:", signerAddress);
      
      const result = await surfClient()
        .useABI(MESSAGE_BOARD_ABI)
        .view.emergency_access({
          functionArguments: [signerAddress as any, patientAddr as any],
          typeArguments: [],
        });
      
      console.log("Emergency access result:", result);
      
      if (result && result.length > 0) {
        setReports(result);
        toast({
          title: "Success",
          description: `Found ${result.length} emergency reports for patient`,
          variant: "default"
        });
      } else {
        setReports([]);
        toast({
          title: "No Reports",
          description: "No emergency reports found for this patient address",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error accessing patient reports:", error);
      setReports([]);
      
      let errorMessage = "Failed to access patient reports";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">Emergency Access</h3>
      <Input placeholder="Patient Address" value={patientAddress} onChange={e => setPatientAddress(e.target.value)} />
      <Button 
        onClick={handleEmergencyAccess} 
        disabled={!patientAddress.trim() || !connected || isLoading}
      >
        {isLoading ? "Accessing..." : "Access Emergency Reports"}
      </Button>
      <div>
        {reports.length > 0 ? (
          <ul>
            {reports.map((r, i) => (
              <li key={i}>{JSON.stringify(r)}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export { EmergencyAccess };
