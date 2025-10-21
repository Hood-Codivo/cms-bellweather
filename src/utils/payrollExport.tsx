import * as XLSX from "xlsx";
import { PayrollRecord } from "@/hooks/usePayroll";

export interface ExportOptions {
  format: "xlsx" | "csv";
  includeStaffDetails: boolean;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

// Format currency for display
const formatCurrency = (amount: number | string | null | undefined): string => {
  const num = Number(amount) || 0;
  return `₦${num.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Format date for display
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// Format datetime for display
const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Transform payroll data for export
export const transformPayrollData = (
  payrolls: PayrollRecord[],
  options: ExportOptions
) => {
  let filteredPayrolls = [...payrolls];

  // Apply date filtering if specified
  if (options.dateRange?.start || options.dateRange?.end) {
    filteredPayrolls = payrolls.filter((payroll) => {
      const payrollStart = new Date(payroll.payPeriodStart);
      const filterStart = options.dateRange?.start
        ? new Date(options.dateRange.start)
        : new Date("1900-01-01");
      const filterEnd = options.dateRange?.end
        ? new Date(options.dateRange.end)
        : new Date("2100-01-01");

      return payrollStart >= filterStart && payrollStart <= filterEnd;
    });
  }

  // Transform data for export
  return filteredPayrolls.map((payroll) => {
    const baseData = {
      "Payroll ID": payroll.id,
      Status: payroll.status.toUpperCase(),
      "Pay Period Start": formatDate(payroll.payPeriodStart),
      "Pay Period End": formatDate(payroll.payPeriodEnd),
      "Base Salary": formatCurrency(payroll.baseSalary),
      "Commission Amount": formatCurrency(payroll.commissionAmount),
      "Overtime Hours": Number(payroll.overtimeHours) || 0,
      "Overtime Rate": formatCurrency(payroll.overtimeRate),
      "Overtime Pay": formatCurrency(
        (Number(payroll.overtimeHours) || 0) *
          (Number(payroll.overtimeRate) || 0)
      ),
      Deductions: formatCurrency(payroll.deductions),
      "Tax Deductions": formatCurrency(payroll.taxDeductions),
      "Gross Pay": formatCurrency(payroll.grossPay),
      "Net Pay": formatCurrency(payroll.netPay),
      "Created Date": formatDateTime(payroll.createdAt),
      "Updated Date": formatDateTime(payroll.updatedAt),
      "Processed Date": formatDateTime(payroll.processedAt),
    };

    // Add staff details if requested
    if (options.includeStaffDetails && payroll.staff) {
      return {
        "Employee ID": payroll.staff.employeeId,
        "First Name": payroll.staff.user?.firstName || "",
        "Last Name": payroll.staff.user?.lastName || "",
        Email: payroll.staff.user?.email || "",
        Department: payroll.staff.department,
        Position: payroll.staff.position,
        "Staff Salary": formatCurrency(payroll.staff.salary),
        "Commission Rate": `${(
          Number(payroll.staff.commissionRate) * 100
        ).toFixed(2)}%`,
        ...baseData,
      };
    }

    return {
      "Staff ID": payroll.staffId,
      ...baseData,
    };
  });
};

// Export to Excel
export const exportToExcel = (
  payrolls: PayrollRecord[],
  options: ExportOptions = { format: "xlsx", includeStaffDetails: true }
) => {
  try {
    const transformedData = transformPayrollData(payrolls, options);

    if (transformedData.length === 0) {
      throw new Error("No data to export");
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(transformedData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 15 }, // Employee ID / Staff ID
      { wch: 20 }, // First Name
      { wch: 20 }, // Last Name
      { wch: 25 }, // Email
      { wch: 15 }, // Department
      { wch: 20 }, // Position
      { wch: 15 }, // Staff Salary
      { wch: 15 }, // Commission Rate
      { wch: 25 }, // Payroll ID
      { wch: 12 }, // Status
      { wch: 15 }, // Pay Period Start
      { wch: 15 }, // Pay Period End
      { wch: 15 }, // Base Salary
      { wch: 18 }, // Commission Amount
      { wch: 12 }, // Overtime Hours
      { wch: 15 }, // Overtime Rate
      { wch: 15 }, // Overtime Pay
      { wch: 15 }, // Deductions
      { wch: 15 }, // Tax Deductions
      { wch: 15 }, // Gross Pay
      { wch: 15 }, // Net Pay
      { wch: 20 }, // Created Date
      { wch: 20 }, // Updated Date
      { wch: 20 }, // Processed Date
    ];

    worksheet["!cols"] = columnWidths.slice(
      0,
      Object.keys(transformedData[0]).length
    );

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Records");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `payroll_export_${timestamp}.xlsx`;

    // Write and download file
    XLSX.writeFile(workbook, filename);

    return {
      success: true,
      filename,
      recordCount: transformedData.length,
    };
  } catch (error) {
    console.error("Export error:", error);
    throw new Error(
      `Failed to export data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Export to CSV
export const exportToCSV = (
  payrolls: PayrollRecord[],
  options: ExportOptions = { format: "csv", includeStaffDetails: true }
) => {
  try {
    const transformedData = transformPayrollData(payrolls, options);

    if (transformedData.length === 0) {
      throw new Error("No data to export");
    }

    // Convert to CSV format
    const headers = Object.keys(transformedData[0]);
    const csvContent = [
      headers.join(","), // Header row
      ...transformedData.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || "";
            // Escape values that contain commas, quotes, or newlines
            if (
              typeof value === "string" &&
              (value.includes(",") ||
                value.includes('"') ||
                value.includes("\n"))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `payroll_export_${timestamp}.csv`;

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      success: true,
      filename,
      recordCount: transformedData.length,
    };
  } catch (error) {
    console.error("CSV export error:", error);
    throw new Error(
      `Failed to export CSV: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Get export summary statistics
export const getExportSummary = (payrolls: PayrollRecord[]) => {
  const totalRecords = payrolls.length;
  const totalGrossPay = payrolls.reduce(
    (sum, payroll) => sum + (Number(payroll.grossPay) || 0),
    0
  );
  const totalNetPay = payrolls.reduce(
    (sum, payroll) => sum + (Number(payroll.netPay) || 0),
    0
  );
  const totalDeductions = payrolls.reduce(
    (sum, payroll) => sum + (Number(payroll.deductions) || 0),
    0
  );

  const statusCounts = payrolls.reduce((counts, payroll) => {
    counts[payroll.status] = (counts[payroll.status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  return {
    totalRecords,
    totalGrossPay: formatCurrency(totalGrossPay),
    totalNetPay: formatCurrency(totalNetPay),
    totalDeductions: formatCurrency(totalDeductions),
    statusCounts,
    dateRange: {
      earliest:
        payrolls.length > 0
          ? Math.min(
              ...payrolls.map((p) => new Date(p.payPeriodStart).getTime())
            )
          : null,
      latest:
        payrolls.length > 0
          ? Math.max(...payrolls.map((p) => new Date(p.payPeriodEnd).getTime()))
          : null,
    },
  };
};
