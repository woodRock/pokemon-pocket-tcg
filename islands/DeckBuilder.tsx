// islands/DeckBuilder.tsx
import { useState, useEffect } from "preact/hooks";
import { PokemonCard } from "../utils/scraper.ts";
import DeckListImporter from "./DeckListImporter.tsx";

export default function DeckBuilder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PokemonCard[]>([]);
  const [deck, setDeck] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved deck from localStorage on component mount
  useEffect(() => {
    const savedDeck = localStorage.getItem("savedDeck");
    if (savedDeck) {
      try {
        setDeck(JSON.parse(savedDeck));
      } catch (e) {
        console.error("Error loading saved deck:", e);
      }
    }
  }, []);

  async function handleSearch(e: Event) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || "Search failed");
      }
      
      setSearchResults(data);
      
      if (data.length === 0) {
        setError(`No cards found for "${searchQuery}"`);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setError(error.message || "Search failed. Please try again.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }

  function addCardToDeck(card: PokemonCard) {
    // Check if we already have 4 of this card
    const cardCount = deck.filter(c => c.id === card.id && c.setId === card.setId).length;
    
    if (cardCount >= 4) {
      alert("You cannot have more than 4 copies of the same card in your deck.");
      return;
    }
    
    // Check if deck has reached the maximum size (60 cards for Pokémon TCG)
    if (deck.length >= 60) {
      alert("Your deck cannot contain more than 60 cards.");
      return;
    }
    
    setDeck([...deck, card]);
  }

  function removeCardFromDeck(index: number) {
    const newDeck = [...deck];
    newDeck.splice(index, 1);
    setDeck(newDeck);
  }

  function saveDeck() {
    try {
      localStorage.setItem("savedDeck", JSON.stringify(deck));
      alert("Deck saved successfully!");
    } catch (error) {
      console.error("Error saving deck:", error);
      alert("Failed to save deck. Please try again.");
    }
  }

  function clearDeck() {
    if (confirm("Are you sure you want to clear your deck?")) {
      setDeck([]);
      localStorage.removeItem("savedDeck");
    }
  }

  function handleImportDeck(importedCards: PokemonCard[]) {
    if (importedCards.length === 0) {
      alert("No valid cards found in the deck list.");
      return;
    }
    
    if (importedCards.length > 60) {
      alert("The imported deck exceeds the maximum of 60 cards. Only the first 60 will be added.");
      importedCards = importedCards.slice(0, 60);
    }
    
    // Replace current deck with imported deck
    setDeck(importedCards);
    alert(`Successfully imported ${importedCards.length} cards!`);
  }

  // Group cards in the deck by name for easier viewing
  function getGroupedDeck() {
    const grouped: Record<string, { card: PokemonCard, count: number }> = {};
    
    deck.forEach(card => {
      const key = `${card.setId}-${card.id}`;
      
      if (grouped[key]) {
        grouped[key].count += 1;
      } else {
        grouped[key] = { card, count: 1 };
      }
    });
    
    return Object.values(grouped);
  }
  
  // Export deck to text format
  function exportDeckToText(): string {
    const grouped = getGroupedDeck();
    
    const pokemonCards = grouped.filter(item => item.card.category === "Pokémon");
    const trainerCards = grouped.filter(item => item.card.category === "Trainer");
    const energyCards = grouped.filter(item => item.card.category === "Energy");
    
    const pokemonCount = pokemonCards.reduce((sum, item) => sum + item.count, 0);
    const trainerCount = trainerCards.reduce((sum, item) => sum + item.count, 0);
    const energyCount = energyCards.reduce((sum, item) => sum + item.count, 0);
    
    let deckText = "";
    
    deckText += `Pokémon: ${pokemonCount}\n`;
    pokemonCards.forEach(item => {
      deckText += `${item.count} ${item.card.name} ${item.card.setId} ${item.card.id}\n`;
    });
    
    deckText += `\nTrainer: ${trainerCount}\n`;
    trainerCards.forEach(item => {
      deckText += `${item.count} ${item.card.name} ${item.card.setId} ${item.card.id}\n`;
    });
    
    deckText += `\nEnergy: ${energyCount}\n`;
    energyCards.forEach(item => {
      deckText += `${item.count} ${item.card.name} ${item.card.setId} ${item.card.id}\n`;
    });
    
    return deckText;
  }
  
  function copyDeckToClipboard() {
    const deckText = exportDeckToText();
    navigator.clipboard.writeText(deckText)
      .then(() => alert("Deck list copied to clipboard!"))
      .catch(err => alert("Failed to copy deck list: " + err.message));
  }

  // Add to islands/DeckBuilder.tsx

  // Add this function to the DeckBuilder component
  async function exportDetailedDeckList() {
    if (deck.length === 0) {
      alert("Your deck is empty. Nothing to export.");
      return;
    }
    
    // Group cards by category and name for better organization
    const grouped = getGroupedDeck();
    const pokemonCards = grouped.filter(item => item.card.category === "Pokémon");
    const trainerCards = grouped.filter(item => item.card.category === "Trainer");
    const energyCards = grouped.filter(item => item.card.category === "Energy");
    
    let exportText = "# DETAILED DECK LIST\n\n";
    
    // Add total count information
    exportText += `Total Cards: ${deck.length}/60\n`;
    exportText += `Pokémon: ${deck.filter(c => c.category === "Pokémon").length}\n`;
    exportText += `Trainer: ${deck.filter(c => c.category === "Trainer").length}\n`;
    exportText += `Energy: ${deck.filter(c => c.category === "Energy").length}\n\n`;
    
    // Export Pokémon with detailed attributes
    exportText += "## POKÉMON\n\n";
    pokemonCards.forEach(({ card, count }) => {
      exportText += `### ${count}x ${card.name} (${card.setId} ${card.id})\n\n`;
      exportText += `Type: ${card.type}\n`;
      exportText += `HP: ${card.hp}\n`;
      
      if (card.stage) {
        exportText += `Stage: ${card.stage}\n`;
      }
      
      if (card.rarity) {
        exportText += `Rarity: ${card.rarity}\n`;
      }
      
      // Add attacks
      if (card.attacks && card.attacks.length > 0) {
        exportText += "\nAttacks:\n";
        card.attacks.forEach(attack => {
          exportText += `- ${attack.name} (${attack.energyRequirement}) - ${attack.damage} damage\n`;
          if (attack.effect) {
            exportText += `  Effect: ${attack.effect}\n`;
          }
        });
      }
      
      // Add weakness, resistance, retreat cost
      if (card.weakness) {
        exportText += `\nWeakness: ${card.weakness}\n`;
      }
      
      if (card.resistance) {
        exportText += `Resistance: ${card.resistance}\n`;
      }
      
      exportText += `Retreat Cost: ${card.retreatCost}\n`;
      
      // Add special rule if present
      if (card.specialRule) {
        exportText += `\nSpecial Rule: ${card.specialRule}\n`;
      }
      
      // Add illustrator if present
      if (card.illustrator) {
        exportText += `Illustrated by: ${card.illustrator}\n`;
      }
      
      exportText += "\n---\n\n";
    });
    
    // Export Trainer cards
    if (trainerCards.length > 0) {
      exportText += "## TRAINER CARDS\n\n";
      trainerCards.forEach(({ card, count }) => {
        exportText += `### ${count}x ${card.name} (${card.setId} ${card.id})\n\n`;
        // Add trainer-specific attributes
        // ...
        exportText += "\n---\n\n";
      });
    }
    
    // Export Energy cards
    if (energyCards.length > 0) {
      exportText += "## ENERGY CARDS\n\n";
      energyCards.forEach(({ card, count }) => {
        exportText += `### ${count}x ${card.name} (${card.setId} ${card.id})\n\n`;
        // Add energy-specific attributes
        // ...
        exportText += "\n---\n\n";
      });
    }
    
    try {
      await navigator.clipboard.writeText(exportText);
      alert("Detailed deck list copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy to clipboard. Your browser may not support this feature.");
    }
  }

  return (
    <div>
      {/* Deck List Importer */}
      <DeckListImporter onImport={handleImportDeck} />
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="border p-4 rounded">
          <h2 class="text-xl font-bold mb-4">Card Search</h2>
          <form onSubmit={handleSearch} class="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
              placeholder="Search for cards..."
              class="w-full p-2 border rounded"
            />
            <button 
              type="submit" 
              class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
          
          {error && (
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div class="grid grid-cols-2 gap-2">
            {searchResults.map((card) => (
              <div key={`${card.setId}-${card.id}`} class="border p-2 rounded hover:shadow-md transition">
                <img src={card.imageUrl} alt={card.name} class="w-full" />
                <p class="font-bold">{card.name}</p>
                <p>{card.type}</p>
                <div class="flex justify-between items-center mt-2">
                  <span class="text-sm text-gray-600">
                    {card.setId} #{card.id}
                  </span>
                  <button 
                    onClick={() => addCardToDeck(card)}
                    class="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div class="border p-4 rounded">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Your Deck ({deck.length}/60)</h2>
            <div>
              <button 
                onClick={saveDeck}
                class="px-3 py-1 bg-blue-500 text-white rounded text-sm mr-2 hover:bg-blue-600 transition"
                disabled={deck.length === 0}
              >
                Save
              </button>
              <button
                onClick={copyDeckToClipboard}
                class="px-3 py-1 bg-green-500 text-white rounded text-sm mr-2 hover:bg-green-600 transition"
                disabled={deck.length === 0}
              >
                Copy List
              </button>
              <button 
                onClick={clearDeck}
                class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                disabled={deck.length === 0}
              >
                Clear
              </button>
              <button 
                onClick={exportDetailedDeckList}
                class="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition"
                disabled={deck.length === 0}
              >
                Export
              </button>
            </div>
          </div>
          
          {deck.length === 0 ? (
            <div class="text-center py-6 text-gray-500">
              Your deck is empty. Search for cards and add them to your deck, or import a deck list.
            </div>
          ) : (
            <div>
              {/* Card type summary */}
              <div class="mb-4 p-2 bg-gray-100 rounded">
                <p><strong>Cards:</strong> {deck.length}/60</p>
                <p><strong>Pokémon:</strong> {deck.filter(c => c.category === "Pokémon").length}</p>
                <p><strong>Trainer:</strong> {deck.filter(c => c.category === "Trainer").length}</p>
                <p><strong>Energy:</strong> {deck.filter(c => c.category === "Energy").length}</p>
              </div>
              
              {/* Grouped cards view */}
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                {getGroupedDeck().map(({ card, count }) => (
                  <div class="border p-2 rounded relative">
                    <span class="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {count}
                    </span>
                    <img src={card.imageUrl} alt={card.name} class="w-full" />
                    <p class="font-bold text-sm">{card.name}</p>
                    <p class="text-xs text-gray-600">{card.setId} #{card.id}</p>
                    <button 
                      onClick={() => {
                        const index = deck.findIndex(c => c.id === card.id && c.setId === card.setId);
                        if (index !== -1) removeCardFromDeck(index);
                      }}
                      class="mt-1 px-2 py-1 bg-red-500 text-white rounded text-xs w-full hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}