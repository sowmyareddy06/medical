import { Button } from "@/components/ui/button";
import { EmergencyAccess } from "./EmergencyAccess";
import { UserProfile } from "./UserProfile";
import { PatientLookup } from "./PatientLookup";

export function DoctorDashboard({ onLogout, username }: { onLogout: () => void; username?: string }) {
  return (
    <div className="flex flex-col gap-6">
      {username && <UserProfile username={username} role="doctor" />}
      <h2 className="text-xl font-bold">Doctor Dashboard</h2>
      <PatientLookup />
      <EmergencyAccess />
      <Button onClick={onLogout}>Logout</Button>
    </div>
  );
}
