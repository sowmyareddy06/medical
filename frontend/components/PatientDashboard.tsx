import { Button } from "@/components/ui/button";
import { MedicalReportUpload } from "./MedicalReportUpload";
import { UserProfile } from "./UserProfile";
import { AuthorizeDoctor } from "./AuthorizeDoctor";

export function PatientDashboard({ onLogout, username }: { onLogout: () => void; username?: string }) {
  return (
    <div className="flex flex-col gap-6">
      {username && <UserProfile username={username} role="patient" />}
      <h2 className="text-xl font-bold">Patient Dashboard</h2>
      <MedicalReportUpload />
      <AuthorizeDoctor />
      <Button onClick={onLogout}>Logout</Button>
    </div>
  );
}
