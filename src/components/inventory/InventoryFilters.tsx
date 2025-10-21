
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { InventoryFilter } from '@/types/inventory';

interface InventoryFiltersProps {
  filter: InventoryFilter;
  onFilterChange: (filter: InventoryFilter) => void;
  categories: string[];
}

export const InventoryFilters = ({ 
  filter, 
  onFilterChange, 
  categories 
}: InventoryFiltersProps) => {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filter, search: value });
  };

  const handleCategoryChange = (value: string) => {
    onFilterChange({ ...filter, category: value === 'all' ? '' : value });
  };

  const clearFilters = () => {
    onFilterChange({ search: '', category: '' });
  };

  const hasActiveFilters = filter.search || filter.category;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search items or suppliers..."
          value={filter.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={filter.category || 'all'} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} size="sm">
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  );
};
