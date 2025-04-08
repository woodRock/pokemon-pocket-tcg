// islands/CardBrowser.tsx
import { useState, useEffect } from "preact/hooks";
import { PokemonCard } from "../utils/scraper.ts";

interface CardBrowserProps {
  initialCards: PokemonCard[];
  sets: { id: string; name: string }[];
  currentPage: number;
  totalPages: number;
  currentSet: string | null;
}

export default function CardBrowser({ 
  initialCards, 
  sets, 
  currentPage, 
  totalPages,
  currentSet 
}: CardBrowserProps) {
  const [cards, setCards] = useState<PokemonCard[]>(initialCards);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSet, setSelectedSet] = useState<string | null>(currentSet);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(currentPage);
  
  // Update URL when filters change
  useEffect(() => {
    let url = "/browse?page=" + page;
    if (selectedSet) {
      url += "&set=" + selectedSet;
    }
    window.history.replaceState({}, "", url);
  }, [page, selectedSet]);
  
  // Handle search input
  async function handleSearch(e: Event) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (!response.ok) throw new Error("Search failed");
      
      const data = await response.json();
      setCards(data);
      setPage(1); // Reset to first page on new search
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }
  
  // Handle set selection
  async function handleSetChange(e: Event) {
    const setId = (e.target as HTMLSelectElement).value;
    setSelectedSet(setId || null);
    setLoading(true);
    
    try {
      if (setId) {
        const response = await fetch(`/api/sets/${setId}`);
        if (!response.ok) throw new Error("Failed to fetch set cards");
        
        const data = await response.json();
        setCards(data);
      } else {
        // Reset to all cards
        const response = await fetch(`/api/cards?page=1&limit=24`);
        if (!response.ok) throw new Error("Failed to fetch cards");
        
        const data = await response.json();
        setCards(data);
      }
      setPage(1); // Reset to first page on set change
    } catch (error) {
      console.error("Set change error:", error);
    } finally {
      setLoading(false);
    }
  }
  
  // Handle pagination
  async function changePage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    
    setLoading(true);
    try {
      let url = `/api/cards?page=${newPage}&limit=24`;
      if (selectedSet) {
        url = `/api/sets/${selectedSet}?page=${newPage}&limit=24`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch page");
      
      const data = await response.json();
      setCards(data);
      setPage(newPage);
      window.scrollTo(0, 0); // Scroll to top on page change
    } catch (error) {
      console.error("Pagination error:", error);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div>
      {/* Filters row */}
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search box */}
        <div class="flex-1">
          <form onSubmit={handleSearch} class="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
              placeholder="Search cards..."
              class="flex-1 p-2 border rounded-l"
            />
            <button 
              type="submit" 
              class="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 transition"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>
        
        {/* Set selector */}
        <div class="md:w-1/3">
          <select
            value={selectedSet || ""}
            onChange={handleSetChange}
            class="w-full p-2 border rounded"
            disabled={loading}
          >
            <option value="">All Sets</option>
            {sets.map(set => (
              <option key={set.id} value={set.id}>
                {set.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p class="mt-2 text-gray-600">Loading cards...</p>
        </div>
      )}
      
      {/* Cards grid */}
      {!loading && cards.length === 0 && (
        <div class="text-center py-12 border rounded bg-gray-50">
          <p class="text-gray-600">No cards found matching your criteria.</p>
        </div>
      )}
      
      {!loading && cards.length > 0 && (
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cards.map(card => (
            <a 
              href={`/card/${card.setId}/${card.id}`} 
              key={`${card.setId}-${card.id}`}
              class="border rounded p-2 hover:shadow-md transition flex flex-col items-center"
            >
              <img src={card.imageUrl} alt={card.name} class="w-full" />
              <p class="font-bold text-sm mt-2 text-center">{card.name}</p>
              <p class="text-xs text-gray-600">{card.setId} #{card.id}</p>
            </a>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div class="flex justify-center mt-8">
          <div class="flex space-x-2">
            <button
              onClick={() => changePage(page - 1)}
              disabled={page === 1 || loading}
              class="px-3 py-1 border rounded hover:bg-gray-100 transition disabled:opacity-50"
            >
              Previous
            </button>
            
            <span class="px-3 py-1 border rounded bg-gray-100">
              Page {page} of {totalPages}
            </span>
            
            <button
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages || loading}
              class="px-3 py-1 border rounded hover:bg-gray-100 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}