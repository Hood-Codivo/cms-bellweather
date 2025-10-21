import React from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Briefcase, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function SettingsPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
  });

  // Initialize form data when user is loaded
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would update the user data here
      // await updateUserProfile(formData);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  const userInitials = (user.name || 'U')
    .split(' ')
    .map((n: string) => n[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              {user.name ? `${user.name}'s account settings` : 'Manage your account settings and preferences'}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" type="button">
                      Change Photo
                    </Button>
                  </div>

                  <div className="grid gap-4 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="phone" className="text-sm font-medium text-muted-foreground">
                          Phone
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Role</p>
                        <p className="text-sm flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          {user.role ? user.role.replace('_', ' ').toUpperCase() : 'N/A'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                        <p className="text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4 border-t mt-4">
                      <Button 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full sm:w-auto"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Update your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Change Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label htmlFor="current-password" className="text-sm font-medium text-muted-foreground">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="current-password"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="new-password" className="text-sm font-medium text-muted-foreground">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="new-password"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="confirm-password" className="text-sm font-medium text-muted-foreground">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button type="button" className="mt-2">
                      Update Password
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-3">Danger Zone</h3>
                  <div className="bg-red-50 p-4 rounded-md border border-red-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-medium text-red-800">Delete Account</h4>
                        <p className="text-sm text-red-600">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                      </div>
                      <Button variant="destructive" size="sm" type="button">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
