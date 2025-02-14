
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
}

export const HeroSearch = ({ searchQuery, setSearchQuery, onSearch }: HeroSearchProps) => {
  return (
    <div className="mx-auto flex max-w-lg items-center gap-2 rounded-full bg-white p-2 shadow-lg">
      <Search className="ml-2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search products..."
        className="flex-1 border-none bg-transparent px-4 py-2 focus:outline-none"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
      />
      <Button variant="default" className="rounded-full" onClick={onSearch}>
        Search
      </Button>
    </div>
  );
};
