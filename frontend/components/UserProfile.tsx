import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserProfileProps {
  username: string;
  role: 'patient' | 'doctor';
}

export function UserProfile({ username, role }: UserProfileProps) {
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // Get user information from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('medicalUsers') || '[]');
    const user = storedUsers.find((u: any) => u.username === username);
    setUserInfo(user);
  }, [username]);

  if (!userInfo) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Profile Information</span>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {role === 'patient' ? 'Patient' : 'Doctor'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Username:</p>
            <p className="font-semibold">{userInfo.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Role:</p>
            <p className="font-semibold capitalize">{userInfo.role}</p>
          </div>
          {userInfo.role === 'patient' && userInfo.contactInfo && (
            <div>
              <p className="text-sm text-gray-600">Contact Info:</p>
              <p className="font-semibold">{userInfo.contactInfo}</p>
            </div>
          )}
          {userInfo.role === 'doctor' && userInfo.licenseNumber && (
            <div>
              <p className="text-sm text-gray-600">License Number:</p>
              <p className="font-semibold">{userInfo.licenseNumber}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Member Since:</p>
            <p className="font-semibold">
              {new Date(userInfo.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
