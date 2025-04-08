// islands/Instructions.tsx
import { useState } from "preact/hooks";

export default function Instructions() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div class="border p-4 rounded mb-6 bg-blue-50">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">📋 How to Use This Application</h2>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
        >
          {isExpanded ? "Hide Instructions" : "Show Instructions"}
        </button>
      </div>
      
      {isExpanded && (
        <div class="mt-4">
          <h3 class="text-lg font-bold mb-2">Option 1: Import a Deck from LimitlessTCG</h3>
          <ol class="list-decimal pl-6 mb-4 space-y-2">
            <li>Build your deck at <a href="https://my.limitlesstcg.com/builder" target="_blank" class="text-blue-600 underline hover:text-blue-800">LimitlessTCG Builder</a></li>
            <li>Make sure the <strong>Game</strong> is set to <strong>Pokemon TCG Pocket</strong></li>
            <li>Click the "<strong>Share</strong>" button in LimitlessTCG</li>
            <li>Select "<strong>Copy as text</strong>" to copy the deck list</li>
            <li>Paste the copied text into the <strong>Import Deck List</strong> box below</li>
            <li>Click "<strong>Build Deck</strong>" to import your cards</li>
            <li>Once imported, you can use the "<strong>Copy Details</strong>" button to get detailed information about all cards in your deck</li>
          </ol>
          
          <h3 class="text-lg font-bold mb-2">Option 2: Build a Deck Here</h3>
          <ol class="list-decimal pl-6 space-y-2">
            <li>Use the <strong>Search</strong> box to find cards by name, type, or other criteria</li>
            <li>Click the <strong>Add</strong> button on cards you want to include in your deck</li>
            <li>Your deck will appear on the right side of the screen</li>
            <li>You can remove cards by clicking the <strong>Remove</strong> button</li>
            <li>Use the <strong>Save</strong> button to store your deck in your browser</li>
            <li>Use the <strong>Copy List</strong> button to get a simple list format of your deck</li>
            <li>Use the <strong>Export</strong> button to get detailed information about all cards</li>
          </ol>
          
          <h3 class="text-lg font-bold mt-4 mb-2">Deck Building Rules</h3>
          <ul class="list-disc pl-6 space-y-1">
            <li>Your deck must contain exactly <strong>60 cards</strong></li>
            <li>You can have up to <strong>4 copies</strong> of any card with the same name (except for basic Energy cards)</li>
            <li>Your deck must contain at least one <strong>Basic Pokémon</strong></li>
          </ul>
          
          <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p class="text-sm text-gray-700">
              <strong>Tip:</strong> After building your deck, use the "<strong>Export</strong>" button to get a comprehensive breakdown of all your cards with their full attributes, attacks, and effects.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}