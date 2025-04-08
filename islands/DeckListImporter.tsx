// islands/DeckListImporter.tsx
import { useState } from "preact/hooks";
import { PokemonCard } from "../utils/scraper.ts";

interface DeckListImporterProps {
  onImport: (cards: PokemonCard[]) => void;
}

export default function DeckListImporter({ onImport }: DeckListImporterProps) {
  const [deckText, setDeckText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    setLoading(true);
    setError(null);
    
    try {
      const cards = await parseDeckList(deckText);
      onImport(cards);
      setDeckText(""); // Clear the input after successful import
    } catch (err) {
      setError(err.message || "Failed to import deck list");
    } finally {
      setLoading(false);
    }
  }

  async function parseDeckList(text: string): Promise<PokemonCard[]> {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    const cardPromises: Promise<PokemonCard[]>[] = [];
    let debugInfo = "Parsing lines:\n";
    
    for (const line of lines) {
      debugInfo += `Line: "${line}"\n`;
      
      // Skip section headers like "Pokémon: 5" or "Trainer: 0"
      if (line.includes(":") && !line.match(/^\d+/)) {
        debugInfo += "  Skipping section header\n";
        continue;
      }
      
      // More flexible regex pattern for card entries
      // This should match formats like:
      // "2 Pikachu ex A2b 22"
      // "1 Charizard ex A2b 10"
      // "2 Bulbasaur A1 1"
      const cardMatch = line.match(/^(\d+)\s+(.*?)\s+([A-Za-z0-9]+)\s+(\d+)$/);
      
      if (cardMatch) {
        const count = parseInt(cardMatch[1]);
        const name = cardMatch[2].trim();
        const setId = cardMatch[3];
        const cardId = cardMatch[4];
        
        debugInfo += `  Matched: Count=${count}, Name="${name}", SetId=${setId}, CardId=${cardId}\n`;
        
        // Fetch each card and replicate based on count
        cardPromises.push(fetchCardsWithCount(setId, cardId, count, name));
      } else {
        debugInfo += `  No match for this line\n`;
      }
    }
    
    console.log(debugInfo); // Log debug info to console
    
    if (cardPromises.length === 0) {
      throw new Error("No valid card entries found. Please check the format of your deck list.");
    }
    
    const cardArrays = await Promise.all(cardPromises);
    return cardArrays.flat();
  }

  async function fetchCardsWithCount(
    setId: string, 
    cardId: string, 
    count: number,
    cardName: string
  ): Promise<PokemonCard[]> {
    try {
      console.log(`Fetching card: ${cardName} (${setId} ${cardId}), count: ${count}`);
      
      const response = await fetch(`/api/card/${setId}/${cardId}`);
      const responseText = await response.text();
      
      // Log the response for debugging
      console.log(`API response for ${setId}/${cardId}:`, {
        status: response.status,
        responseText: responseText.substring(0, 100) + (responseText.length > 100 ? "..." : "")
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch card: ${cardName} (${setId} ${cardId})`);
      }
      
      let cardData;
      try {
        cardData = JSON.parse(responseText);
      } catch (err) {
        console.error("Failed to parse JSON response:", err);
        throw new Error(`Invalid response for card: ${cardName}`);
      }
      
      if (!cardData || cardData.error) {
        throw new Error(cardData?.error || `Failed to fetch card: ${cardName}`);
      }
      
      // Replicate the card based on count
      return Array(count).fill(cardData);
    } catch (error) {
      console.error(`Error fetching card ${setId}/${cardId}:`, error);
      throw new Error(`Failed to import card: ${cardName}`);
    }
  }
    

  return (
    <div class="border p-4 rounded mb-4">
      <h2 class="text-lg font-bold mb-2">Import Deck List</h2>
      
      <textarea
        value={deckText}
        onChange={(e) => setDeckText((e.target as HTMLTextAreaElement).value)}
        placeholder={`Paste your deck list here, for example:

Pokémon: 5
2 Pikachu ex A2b 22
1 Charizard ex A2b 10
2 Bulbasaur A1 1
Trainer: 0`}
        class="w-full p-2 border rounded h-40 font-mono text-sm"
      />
      
      {error && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-2 mb-2">
          {error}
        </div>
      )}
      
      <button
        onClick={handleImport}
        disabled={loading || !deckText.trim()}
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
      >
        {loading ? "Importing..." : "Build Deck"}
      </button>
    </div>
  );
}