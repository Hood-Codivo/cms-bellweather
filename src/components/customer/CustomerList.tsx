import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";

const CustomerList = () => {
  const {
    customers,
    loading,
    error,
    selectedCustomer,
    getCustomerById,
    clearSelectedCustomer,
    refetch,
  } = useCustomers();

  // Debug log for component props/state
  console.log("CustomerList render:", {
    customers,
    loading,
    error,
    selectedCustomer: !!selectedCustomer,
    customersCount: Array.isArray(customers)
      ? customers.length
      : "not an array",
  });

  // Normalise customers into an array (defensive)
  const customersList: any[] = (() => {
    if (Array.isArray(customers)) {
      console.log("Customers is already an array");
      return customers;
    }

    // if (customers && typeof customers === 'object' && 'data' in customers && Array.isArray(customers.data: )) {
    //   console.log('Found customers in data property');
    //   return customers.data;
    // }

    console.warn(
      "Could not determine customers format, defaulting to empty array",
      { customers }
    );
    return [];
  })();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showDetails, setShowDetails] = useState(false);

  const filteredCustomers = customersList.filter((customer) => {
    if (!customer) return false;
    const matchesSearch =
      (customer.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (customer.email?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (customer.phone || "").includes(searchTerm);
    const matchesFilter =
      filterType === "all" || customer.customerType === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (!aValue) aValue = "";
    if (!bValue) bValue = "";
    aValue = aValue.toString().toLowerCase();
    bValue = bValue.toString().toLowerCase();
    return sortOrder === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleViewDetails = async (customerId: string) => {
    await getCustomerById(customerId);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    clearSelectedCustomer();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCustomerTypeIcon = (type: string) =>
    type === "business" ? (
      <Building className="h-4 w-4" />
    ) : (
      <User className="h-4 w-4" />
    );
  const getCustomerTypeBadge = (type: string) => (
    <Badge variant={type === "business" ? "default" : "secondary"}>
      <div className="flex items-center gap-1">
        {getCustomerTypeIcon(type)}
        {type === "business" ? "Business" : "Individual"}
      </div>
    </Badge>
  );

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <span className="ml-1 opacity-50">↕</span>;
    return <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  // Use normalized array length for loading/stats
  if (loading && customersList.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Customer Management
            </h1>
            <p className="text-gray-600">
              Manage and view all customer information
            </p>
          </div>
          <Button onClick={refetch} variant="outline" disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {customersList.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Business Customers
              </CardTitle>
              <Building className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {
                  customersList.filter((c) => c.customerType === "business")
                    .length
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Individual Customers
              </CardTitle>
              <User className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {
                  customersList.filter((c) => c.customerType === "individual")
                    .length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search customers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="customerType">Type</SelectItem>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customer Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer List ({sortedCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("name")}
                    >
                      Name <SortIcon field="name" />
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("customerType")}
                    >
                      Type <SortIcon field="customerType" />
                    </TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("createdAt")}
                    >
                      Created <SortIcon field="createdAt" />
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getCustomerTypeIcon(customer.customerType)}
                          {customer.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCustomerTypeBadge(customer.customerType)}
                      </TableCell>
                      <TableCell>
                        {customer.address ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span
                              className="truncate max-w-32"
                              title={customer.address}
                            >
                              {customer.address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(customer.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(customer.id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {sortedCustomers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || filterType !== "all"
                  ? "No customers found matching your search criteria"
                  : "No customers found"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Details Modal */}
        {showDetails && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getCustomerTypeIcon(selectedCustomer.customerType)}
                    Customer Details
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCloseDetails}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Complete information for this customer
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedCustomer.name}
                  </h3>
                  <div className="mt-1">
                    {getCustomerTypeBadge(selectedCustomer.customerType)}
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                  )}

                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                  )}

                  {selectedCustomer.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-sm">
                        {selectedCustomer.address}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Created: {formatDate(selectedCustomer.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Updated: {formatDate(selectedCustomer.updatedAt)}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleCloseDetails} className="w-full">
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
