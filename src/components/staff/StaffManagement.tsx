import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Edit, Trash2, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import api from "@/api/axios";
import { toast } from "sonner";
import { useStaff } from "@/hooks/useStaff";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define the staff interface based on the API response
import type {
  StaffUser as ApiStaffUser,
  StaffMember as ApiStaffMember,
} from "@/hooks/useStaff";

type FormStaffUser = ApiStaffUser & { password?: string; phone?: string };
type FormStaffMember = Omit<ApiStaffMember, "user"> & { user: FormStaffUser };

export function StaffManagement() {
  const [staff, setStaff] = useState<ApiStaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<FormStaffMember>>({
    employeeId: "",
    department: "",
    position: "",
    salary: "",
    commissionRate: "0",
    hireDate: "",
    isActive: true,
    user: {
      id: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "admin",
      isActive: true,
      createdAt: "",
      updatedAt: "",
      password: undefined,
      phone: "",
    },
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    staff: staffData,
    isLoading,
    error: apiError,
    fetchStaff,
    addStaff,
    editStaff,
    deleteStaff,
  } = useStaff();

  // Fetch staff data from API
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const filteredStaff = staffData.filter(
    (member) =>
      `${member.user.firstName} ${member.user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "sales":
        return "bg-green-100 text-green-800";
      case "marketer":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDialogOpen = (editMember?: ApiStaffMember) => {
    if (editMember) {
      setForm(editMember);
      setEditId(editMember.id);
    } else {
      setForm({
        employeeId: "",
        department: "",
        position: "",
        salary: "",
        commissionRate: "0",
        hireDate: "",
        isActive: true,
        user: {
          id: "",
          email: "",
          firstName: "",
          lastName: "",
          role: "admin",
          isActive: true,
          createdAt: "",
          updatedAt: "",
          password: undefined,
          phone: "",
        },
      });
      setEditId(null);
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setForm({
      employeeId: "",
      department: "",
      position: "",
      salary: "",
      commissionRate: "0",
      hireDate: "",
      isActive: true,
      user: {
        id: "",
        email: "",
        firstName: "",
        lastName: "",
        role: "admin",
        isActive: true,
        createdAt: "",
        updatedAt: "",
        password: undefined,
        phone: "",
      },
    });
    setEditId(null);
  };

  const handleFormChange = (key: string, value: any) => {
    if (key.startsWith("user.")) {
      const userKey = key.replace("user.", "");
      setForm((prev) => ({
        ...prev,
        user: {
          ...prev.user!,
          [userKey]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.employeeId ||
      !form.department ||
      !form.position ||
      !form.salary ||
      !form.hireDate ||
      !form.user?.email ||
      !form.user?.firstName ||
      !form.user?.lastName ||
      !form.user?.role
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    setIsSubmitting(true);
    // Build payload as per backend requirements
    const payload = {
      email: form.user.email,
      password: form.user.password || undefined, // Only for create, not edit
      firstName: form.user.firstName,
      lastName: form.user.lastName,
      role: form.user.role,
      phone: form.user.phone || "",
      employeeId: form.employeeId,
      department: form.department,
      position: form.position,
      hireDate: form.hireDate,
      salary: Number(form.salary),
      commissionRate: Number(form.commissionRate) || 0,
    };
    try {
      if (editId) {
        // Remove password for update
        const { password, ...updatePayload } = payload;
        await editStaff(editId, updatePayload);
        toast.success("Staff updated successfully!");
      } else {
        if (!form.user.password) {
          toast.error("Password is required for new staff.");
          setIsSubmitting(false);
          return;
        }
        await addStaff(payload);
        toast.success("Staff added successfully!");
      }
      handleDialogClose();
    } catch (err) {
      toast.error("Failed to save staff. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsSubmitting(true);
    try {
      await deleteStaff(deleteId);
      toast.success("Staff deleted successfully!");
      setDeleteId(null);
    } catch (err) {
      toast.error("Failed to delete staff. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !isSubmitting) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading staff data...</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{apiError}</p>
        <Button onClick={fetchStaff}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Loader overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
            <span>Processing...</span>
          </div>
        </div>
      )}
      {/* Delete confirmation modal */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <p>
              Are you sure you want to delete this staff member? This action
              cannot be undone.
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Staff Management
          </h2>
          <p className="text-muted-foreground">
            Manage employee information and roles
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => handleDialogOpen()}>
              <Plus className="h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editId ? "Edit Staff Member" : "Add Staff Member"}
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Employee ID
                  </label>
                  <Input
                    value={form.employeeId}
                    onChange={(e) =>
                      handleFormChange("employeeId", e.target.value)
                    }
                    required
                    placeholder="EMP-1001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Department
                  </label>
                  <Input
                    value={form.department}
                    onChange={(e) =>
                      handleFormChange("department", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Position
                  </label>
                  <Input
                    value={form.position}
                    onChange={(e) =>
                      handleFormChange("position", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Salary
                  </label>
                  <Input
                    value={form.salary}
                    onChange={(e) => handleFormChange("salary", e.target.value)}
                    required
                    type="number"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Commission Rate
                  </label>
                  <Input
                    value={form.commissionRate}
                    onChange={(e) =>
                      handleFormChange("commissionRate", e.target.value)
                    }
                    type="number"
                    min={0}
                    max={1}
                    step={0.01}
                    placeholder="0.05"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Hire Date
                  </label>
                  <Input
                    value={form.hireDate}
                    onChange={(e) =>
                      handleFormChange("hireDate", e.target.value)
                    }
                    required
                    type="date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <Input
                    value={form.user?.firstName}
                    onChange={(e) =>
                      handleFormChange("user.firstName", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <Input
                    value={form.user?.lastName}
                    onChange={(e) =>
                      handleFormChange("user.lastName", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    value={form.user?.email}
                    onChange={(e) =>
                      handleFormChange("user.email", e.target.value)
                    }
                    required
                    type="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <Select
                    value={form.user?.role}
                    onValueChange={(value) =>
                      handleFormChange("user.role", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketer">Marketer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <Select
                    value={form.isActive ? "active" : "inactive"}
                    onValueChange={(value) =>
                      handleFormChange("isActive", value === "active")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password{" "}
                    {editId ? (
                      <span className="text-xs text-muted-foreground">
                        (leave blank to keep unchanged)
                      </span>
                    ) : null}
                  </label>
                  <Input
                    value={form.user?.password || ""}
                    onChange={(e) =>
                      handleFormChange("user.password", e.target.value)
                    }
                    type="password"
                    placeholder={
                      editId
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                    required={!editId}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <Input
                    value={form.user?.phone || ""}
                    onChange={(e) =>
                      handleFormChange("user.phone", e.target.value)
                    }
                    type="tel"
                    placeholder="08012345678"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button type="submit">{editId ? "Update" : "Add"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>
            All registered employees ({staffData.length} total)
          </CardDescription>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? "No staff members found matching your search."
                : "No staff members found."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {member.user.firstName.charAt(0)}
                        {member.user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h4 className="font-semibold">
                        {member.user.firstName} {member.user.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleColor(member.user.role)}>
                          {member.user.role.replace("_", " ").toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {member.department}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {member.employeeId}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <DollarSign className="h-4 w-4" />₦
                        {parseFloat(member.salary).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Hired: {new Date(member.hireDate).toLocaleDateString()}
                      </p>
                      {parseFloat(member.commissionRate) > 0 && (
                        <p className="text-xs text-orange-600">
                          {parseFloat(member.commissionRate) * 100}% commission
                        </p>
                      )}
                      <Badge
                        variant={member.isActive ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDialogOpen(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => setDeleteId(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
