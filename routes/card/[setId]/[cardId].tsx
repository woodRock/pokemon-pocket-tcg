// routes/card/[setId]/[cardId].tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import { fetchCardDetails, PokemonCard } from "../../../utils/scraper.ts";

interface CardPageData {
  card: PokemonCard | null;
}

export const handler: Handlers<CardPageData> = {
  async GET(req, ctx) {
    const { setId, cardId } = ctx.params;
    const card = await fetchCardDetails(setId, cardId);
    
    return ctx.render({ card });
  }
};

function EnergySymbols({ energyString }: { energyString: string }) {
  // Convert energy string (e.g., "LLL") to energy symbols or icons
  return (
    <div class="flex space-x-1">
      {energyString.split('').map((energy, index) => {
        let bgColor = "bg-gray-300";
        let text = energy;
        
        switch (energy) {
          case 'L': bgColor = "bg-yellow-300"; text = "⚡"; break;
          case 'F': bgColor = "bg-red-500"; text = "🔥"; break;
          case 'W': bgColor = "bg-blue-400"; text = "💧"; break;
          case 'G': bgColor = "bg-green-500"; text = "🌿"; break;
          case 'P': bgColor = "bg-purple-500"; text = "👁️"; break;
          case 'D': bgColor = "bg-gray-700 text-white"; text = "🌙"; break;
          case 'M': bgColor = "bg-gray-400"; text = "⚙️"; break;
          case 'C': bgColor = "bg-gray-200"; text = "⭐"; break;
        }
        
        return (
          <div key={index} class={`w-6 h-6 rounded-full ${bgColor} flex items-center justify-center text-xs font-bold`}>
            {text}
          </div>
        );
      })}
    </div>
  );
}

export default function CardPage({ data }: PageProps<CardPageData>) {
  const { card } = data;
  
  if (!card) {
    return <div class="p-4">Card not found</div>;
  }
  
  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <h1 class="text-2xl font-bold mb-4">{card.name}</h1>
      <div class="flex flex-col md:flex-row gap-4">
        <div class="md:w-1/2">
          <img src={card.imageUrl} alt={card.name} class="w-full" />
        </div>
        <div class="md:w-1/2">
          <p><strong>Type:</strong> {card.type}</p>
          <p><strong>HP:</strong> {card.hp}</p>
          <p><strong>Category:</strong> {card.category}</p>
          <p><strong>Rarity:</strong> {card.rarity}</p>
          
          {card.stage && <p><strong>Stage:</strong> {card.stage}</p>}
          
          {card.attacks && card.attacks.length > 0 && (
            <div class="mt-4">
              <strong>Attacks:</strong>
              <ul class="mt-1 space-y-3">
                {card.attacks.map((attack, index) => (
                  <li key={index} class="border rounded p-2 bg-gray-50">
                    <div class="flex items-center gap-2">
                      <EnergySymbols energyString={attack.energyRequirement} />
                      <span class="font-bold">{attack.name}</span>
                      {attack.damage && (
                        <span class="ml-auto font-bold">{attack.damage}</span>
                      )}
                    </div>
                    {attack.effect && (
                      <p class="text-sm mt-1">{attack.effect}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {card.weakness && <p class="mt-3"><strong>Weakness:</strong> {card.weakness}</p>}
          {card.resistance && <p><strong>Resistance:</strong> {card.resistance}</p>}
          <p><strong>Retreat Cost:</strong> {card.retreatCost}</p>
          
          {card.specialRule && (
            <div class="mt-3 p-2 bg-gray-100 rounded">
              <p><strong>Special Rule:</strong> {card.specialRule}</p>
            </div>
          )}
          
          {card.illustrator && <p class="mt-4 text-sm"><strong>Illustrated by:</strong> {card.illustrator}</p>}
        </div>
      </div>
    </div>
  );
}