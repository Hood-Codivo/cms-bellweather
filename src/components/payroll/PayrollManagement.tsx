import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Download,
  Plus,
  Edit,
  Trash2,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { usePayroll } from "@/hooks/usePayroll";
import { useAuth } from "@/hooks/useAuth";
import { useStaff, StaffMember } from "@/hooks/useStaff";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  exportToExcel,
  exportToCSV,
  getExportSummary,
  ExportOptions,
} from "@/utils/payrollExport";

export function PayrollManagement() {
  const {
    payrolls,
    isLoading,
    error,
    fetchPayrolls,
    createPayroll,
    updatePayroll,
    deletePayroll,
  } = usePayroll();

  const {
    fetchStaffByEmployeeId,
    resetMarketerSalaries,
    isLoading: isStaffLoading,
  } = useStaff();

  const [showForm, setShowForm] = useState(false);
  const [editPayroll, setEditPayroll] = useState(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "xlsx",
    includeStaffDetails: true,
    dateRange: {},
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { user } = useAuth();
  const [form, setForm] = useState({
    staffId: "",
    payPeriodStart: "",
    payPeriodEnd: "",
    baseSalary: undefined,
    commissionAmount: undefined,
    overtimeHours: undefined,
    overtimeRate: undefined,
    deductions: undefined,
  });

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  useEffect(() => {
    console.log("Payrolls:", payrolls);
  }, [payrolls]);

  const handleExport = async () => {
    if (payrolls.length === 0) {
      toast.error("No payroll data to export");
      return;
    }

    setIsSubmitting(true);
    try {
      const summary = getExportSummary(payrolls);

      let result;
      if (exportOptions.format === "xlsx") {
        result = exportToExcel(payrolls, exportOptions);
      } else {
        result = exportToCSV(payrolls, exportOptions);
      }

      if (result.success) {
        toast.success(
          `Successfully exported ${result.recordCount} payroll records to ${result.filename}`,
          {
            description: `Total Net Pay: ${summary.totalNetPay}`,
          }
        );
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsSubmitting(false);
      setShowExportOptions(false);
    }
  };

  const handleQuickExport = async (format: "xlsx" | "csv") => {
    const quickOptions: ExportOptions = {
      format,
      includeStaffDetails: true,
    };

    if (payrolls.length === 0) {
      toast.error("No payroll data to export");
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      if (format === "xlsx") {
        result = exportToExcel(payrolls, quickOptions);
      } else {
        result = exportToCSV(payrolls, quickOptions);
      }

      if (result.success) {
        toast.success(
          `Exported ${result.recordCount} records to ${result.filename}`
        );
      }
    } catch (error) {
      console.error("Quick export failed:", error);
      toast.error("Export failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = async (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (key === "staffId") {
      if (value) {
        const staff = await fetchStaffByEmployeeId(value);
        if (staff) {
          setCurrentStaff(staff);
          setForm((prev) => ({
            ...prev,
            baseSalary: Number(staff.salary) || undefined,
            commissionAmount: Number(staff.commissionRate) || undefined,
          }));
        } else {
          setCurrentStaff(null);
          setForm((prev) => ({
            ...prev,
            baseSalary: undefined,
            commissionAmount: undefined,
          }));
          toast.error("Staff not found");
        }
      } else {
        setCurrentStaff(null);
        setForm((prev) => ({
          ...prev,
          baseSalary: undefined,
          commissionAmount: undefined,
        }));
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staffId || !form.payPeriodStart || !form.payPeriodEnd) {
      toast.error("Staff, pay period start, and end are required.");
      return;
    }

    const staff = await fetchStaffByEmployeeId(form.staffId);
    if (!staff) {
      toast.error("Staff member not found. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        staffId: staff.id,
      };

      if (editPayroll) {
        await updatePayroll(editPayroll.id, payload);
        toast.success("Payroll updated successfully!");
      } else {
        await createPayroll(payload);
        toast.success("Payroll created successfully!");
      }
      setShowForm(false);
      setEditPayroll(null);
      setCurrentStaff(null);
      setForm({
        staffId: "",
        payPeriodStart: "",
        payPeriodEnd: "",
        baseSalary: undefined,
        commissionAmount: undefined,
        overtimeHours: undefined,
        overtimeRate: undefined,
        deductions: undefined,
      });
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors && err.response.data.errors.join(", ")) ||
        err?.message ||
        "Failed to save payroll. Please try again.";
      toast.error(backendMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (record: any) => {
    setEditPayroll(record);
    const staff = await fetchStaffByEmployeeId(record.staffId);
    if (staff) {
      setCurrentStaff(staff);
    }
    setForm({
      staffId: record.staffId,
      payPeriodStart: record.payPeriodStart.split("T")[0],
      payPeriodEnd: record.payPeriodEnd.split("T")[0],
      baseSalary: record.baseSalary,
      commissionAmount: record.commissionAmount,
      overtimeHours: record.overtimeHours,
      overtimeRate: record.overtimeRate,
      deductions: record.deductions,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsSubmitting(true);
    try {
      await deletePayroll(deleteId);
      toast.success("Payroll deleted successfully!");
      setDeleteId(null);
    } catch (err) {
      toast.error("Failed to delete payroll. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetMarketerSalaries = async () => {
    if (!user || !["admin", "super_admin"].includes(user.role)) {
      toast.error("You don't have permission to reset marketer salaries");
      return;
    }

    setIsResetting(true);
    try {
      const result = await resetMarketerSalaries();
      toast.success(
        result.message ||
          `Successfully reset salaries for ${result.count || 0} marketers`
      );
      setShowResetConfirm(false);
      // Refresh payroll data
      await fetchPayrolls();
    } catch (error) {
      console.error("Error resetting marketer salaries:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reset marketer salaries";
      toast.error(errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeletePayroll = async () => {
    if (!deleteId) return;

    setIsSubmitting(true);
    try {
      await deletePayroll(deleteId);
      toast.success("Payroll deleted successfully!");
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete payroll:", error);
      toast.error("Failed to delete payroll. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  // Get export summary for display
  const exportSummary = payrolls.length > 0 ? getExportSummary(payrolls) : null;

  if (isLoading && !isSubmitting) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading payroll data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchPayrolls}>Retry</Button>
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

      {/* Export Options Modal */}
      {showExportOptions && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Export Options</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Export Format
                </label>
                <Select
                  value={exportOptions.format}
                  onValueChange={(value: "xlsx" | "csv") =>
                    setExportOptions((prev) => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeStaffDetails}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeStaffDetails: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm">Include Staff Details</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Date Range Filter (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={exportOptions.dateRange?.start || ""}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value },
                      }))
                    }
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={exportOptions.dateRange?.end || ""}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              {exportSummary && (
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>
                    <strong>Records to export:</strong>{" "}
                    {exportSummary.totalRecords}
                  </p>
                  <p>
                    <strong>Total Net Pay:</strong> {exportSummary.totalNetPay}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowExportOptions(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isSubmitting}>
                {isSubmitting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Salaries Confirmation Modal */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Marketer Salaries</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all marketer salaries to their base amounts. This
              action cannot be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={resetMarketerSalaries}
              disabled={isResetting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isResetting ? "Resetting..." : "Reset Salaries"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation modal */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payroll Record</AlertDialogTitle>
            <p>
              Are you sure you want to delete this payroll record? This action
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
            Payroll Management
          </h2>
          <p className="text-muted-foreground">
            Employee salary processing and commission tracking
          </p>
        </div>
        <div className="flex gap-2">
          {/* Export Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowExportOptions(true)}
              disabled={payrolls.length === 0}
            >
              <Download className="h-4 w-4" />
              Export Report
              <ChevronDown className="h-4 w-4" />
            </Button>

            {/* Quick export buttons */}
            <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <Button
                size="sm"
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => handleQuickExport("xlsx")}
                disabled={payrolls.length === 0}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Quick Excel Export
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => handleQuickExport("csv")}
                disabled={payrolls.length === 0}
              >
                <FileText className="h-4 w-4" />
                Quick CSV Export
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowResetConfirm(true)}
            disabled={!user || !["admin", "super_admin"].includes(user.role)}
            title={
              !user || !["admin", "super_admin"].includes(user.role)
                ? "Only admins can reset salaries"
                : "Reset all marketer salaries to base amounts"
            }
          >
            <RefreshCw className="h-4 w-4" />
            Reset Marketer Salaries
          </Button>

          <Button
            className="gap-2"
            onClick={() => {
              setShowForm(true);
              setEditPayroll(null);
            }}
          >
            <Plus className="h-4 w-4" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {exportSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Records
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exportSummary.totalRecords}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Gross Pay
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {exportSummary.totalGrossPay}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Net Pay
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {exportSummary.totalNetPay}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Deductions
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {exportSummary.totalDeductions}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payroll Records */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>Individual employee payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrolls.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No payroll records found.
              </div>
            ) : (
              payrolls.map((record) => (
                <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">
                        {record.staff?.user?.firstName}{" "}
                        {record.staff?.user?.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {record.staff?.user?.email} • {record.staff?.employeeId}{" "}
                        • {record.staff?.department}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pay Period: {record.payPeriodStart?.split("T")[0]} to{" "}
                        {record.payPeriodEnd?.split("T")[0]}
                      </p>
                    </div>
                    <Badge
                      variant={
                        record.status === "paid" ? "default" : "secondary"
                      }
                    >
                      {record.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => setDeleteId(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Base Salary</p>
                      <p className="font-semibold">
                        ₦{Number(record.staff?.salary || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Commission</p>
                      <p className="font-semibold text-orange-600">
                        ₦
                        {Number(
                          record.staff?.commissionRate || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Overtime</p>
                      <p className="font-semibold text-green-600">
                        {Number(record.overtimeHours || 0)} hrs @ ₦
                        {Number(record.overtimeRate || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deductions</p>
                      <p className="font-semibold text-red-600">
                        -₦{Number(record.deductions || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Net Pay</p>
                      <p className="font-bold text-lg">
                        ₦{Number(record.netPay || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Payroll Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">
              {editPayroll ? "Edit Payroll" : "Process Payroll"}
            </h3>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Staff ID
                </label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.staffId}
                  onChange={(e) => handleFormChange("staffId", e.target.value)}
                  required
                  placeholder="Staff ID"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pay Period Start
                  </label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.payPeriodStart}
                    onChange={(e) =>
                      handleFormChange("payPeriodStart", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pay Period End
                  </label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.payPeriodEnd}
                    onChange={(e) =>
                      handleFormChange("payPeriodEnd", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Base Salary
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
                    value={form.baseSalary || ""}
                    readOnly
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Commission Amount
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
                    value={form.commissionAmount || ""}
                    readOnly
                    min={0}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Overtime Hours
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.overtimeHours || ""}
                    onChange={(e) =>
                      handleFormChange(
                        "overtimeHours",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Overtime Rate
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.overtimeRate || ""}
                    onChange={(e) =>
                      handleFormChange(
                        "overtimeRate",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    min={0}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Deductions
                </label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.deductions || ""}
                  onChange={(e) =>
                    handleFormChange(
                      "deductions",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  min={0}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditPayroll(null);
                    setCurrentStaff(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving..."
                    : editPayroll
                    ? "Update Payroll"
                    : "Create Payroll"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
