// utils/scraper.ts
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

export interface Attack {
  name: string;
  damage: string;
  effect: string;
  energyRequirement: string;
}

export interface PokemonCard {
  id: string;
  setId: string;
  name: string;
  imageUrl: string;
  type: string;
  hp: number;
  category: string;
  stage?: string;
  rarity: string;
  attacks: Attack[];
  weakness?: string;
  resistance?: string;
  retreatCost: number;
  specialRule?: string;
  illustrator?: string;
}

// A cache to store cards we've seen before
let cardCache: PokemonCard[] = [];

export async function fetchCardDetails(setId: string, cardId: string): Promise<PokemonCard | null> {
  try {
    const url = `https://pocket.limitlesstcg.com/cards/${setId}/${cardId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch card: ${response.status}`);
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) {
      throw new Error("Failed to parse HTML");
    }
    
    // Find the card details text block
    const cardDetailsText = document.querySelector(".card-details")?.textContent?.trim() || "";
    
    // Parse basic card details using the function from before
    const cardDetails = parseCardDetails(cardDetailsText);
    
    // Parse attack information from specific elements
    const attacks: Attack[] = [];
    const attackInfoElements = document.querySelectorAll(".card-text-attack-info");
    const attackEffectElements = document.querySelectorAll(".card-text-attack-effect");
    
    for (let i = 0; i < attackInfoElements.length; i++) {
      const infoElement = attackInfoElements[i];
      const effectElement = i < attackEffectElements.length ? attackEffectElements[i] : null;
      
      // Parse attack info element to extract name, damage, and energy requirement
      const attackName = infoElement.querySelector(".attack-name")?.textContent?.trim() || 
                         infoElement.textContent?.trim().replace(/\d+$/, "").trim() || "";
      
      // Extract damage value (typically at end of the attack info)
      const damageMatch = infoElement.textContent?.trim().match(/(\d+)$/);
      const damage = damageMatch ? damageMatch[1] : "";
      
      // Extract energy requirements (img elements or energy symbols)
      const energyImgs = infoElement.querySelectorAll("img.energy-symbol");
      let energyRequirement = "";
      
      if (energyImgs.length > 0) {
        // If there are energy symbol images, get their types from src or alt attributes
        energyImgs.forEach((img) => {
          const energyType = getEnergyTypeFromImg(img);
          energyRequirement += energyType;
        });
      } else {
        // If no images, try to extract from text (e.g., "LLL" for 3 Lightning)
        const energyMatch = infoElement.textContent?.match(/([LFWGPDMC]+)/);
        if (energyMatch) {
          energyRequirement = energyMatch[1];
        }
      }
      
      // Get effect text
      const effect = effectElement?.textContent?.trim() || "";
      
      attacks.push({
        name: attackName,
        damage,
        effect,
        energyRequirement
      });
    }
    
    // If we found attack elements but no attacks were parsed from the basic text,
    // use the specifically parsed attacks
    if (attacks.length > 0) {
      cardDetails.attacks = attacks;
    }
    
    // Get card image
    const imageUrl = document.querySelector(".card-image img")?.getAttribute("src") || "";
    
    // Extract rarity information if available
    const rarityElement = document.querySelector(".card-rarity");
    const rarity = rarityElement?.textContent?.trim() || "Unknown";
    
    const card = {
      id: cardId,
      setId,
      name: cardDetails.name,
      imageUrl,
      type: cardDetails.type,
      hp: cardDetails.hp,
      category: cardDetails.category,
      stage: cardDetails.stage,
      rarity,
      attacks: cardDetails.attacks,
      weakness: cardDetails.weakness,
      resistance: cardDetails.resistance,
      retreatCost: cardDetails.retreatCost,
      specialRule: cardDetails.specialRule,
      illustrator: cardDetails.illustrator
    };
    
    // Add to our cache for future searches
    const existingCardIndex = cardCache.findIndex(c => c.id === cardId && c.setId === setId);
    if (existingCardIndex !== -1) {
      cardCache[existingCardIndex] = card;
    } else {
      cardCache.push(card);
    }
    
    return card;
  } catch (error) {
    console.error("Error fetching card:", error);
    return null;
  }
}

function getEnergyTypeFromImg(img: Element): string {
  // Extract energy type from image src or alt attribute
  // Example: if src contains "lightning.png" return "L"
  const src = img.getAttribute("src") || "";
  const alt = img.getAttribute("alt") || "";
  
  if (src.includes("lightning") || alt.includes("Lightning")) return "L";
  if (src.includes("fire") || alt.includes("Fire")) return "F";
  if (src.includes("water") || alt.includes("Water")) return "W";
  if (src.includes("grass") || alt.includes("Grass")) return "G";
  if (src.includes("psychic") || alt.includes("Psychic")) return "P";
  if (src.includes("fighting") || alt.includes("Fighting")) return "F";
  if (src.includes("darkness") || alt.includes("Darkness")) return "D";
  if (src.includes("metal") || alt.includes("Metal")) return "M";
  if (src.includes("colorless") || alt.includes("Colorless")) return "C";
  
  // Default to "C" (colorless) if unknown
  return "C";
}

function parseCardDetails(text: string): Partial<PokemonCard> & { attacks: Attack[] } {
  // Example text: "Pikachu ex - Lightning - 120 HP Pokémon - Basic LLL Thunderbolt 150 Discard all Energy from this Pokémon. Weakness: Fighting Retreat: 1 ex rule: When your Pokémon ex is Knocked Out, your opponent gets 2 points. Illustrated by PLANETA Igarashi"
  
  const result: Partial<PokemonCard> & { attacks: Attack[] } = {
    attacks: []
  };
  
  // Extract name and type
  const nameTypeMatch = text.match(/^([^-]+) - ([^-]+) -/);
  if (nameTypeMatch) {
    result.name = nameTypeMatch[1].trim();
    result.type = nameTypeMatch[2].trim();
  }
  
  // Extract HP
  const hpMatch = text.match(/(\d+) HP/);
  result.hp = hpMatch ? parseInt(hpMatch[1]) : 0;
  
  // Extract category and stage
  const categoryStageMatch = text.match(/HP Pokémon - ([^L]+)/);
  if (categoryStageMatch) {
    const categoryStage = categoryStageMatch[1].trim();
    if (categoryStage === "Basic") {
      result.category = "Pokémon";
      result.stage = "Basic";
    } else {
      // Handle Stage 1, Stage 2, etc.
      const stageParts = categoryStage.split(" ");
      if (stageParts.length >= 2) {
        result.category = "Pokémon";
        result.stage = `${stageParts[0]} ${stageParts[1]}`;
      } else {
        result.category = categoryStage;
      }
    }
  } else {
    // Default to Pokémon category if we can't extract it
    result.category = "Pokémon";
  }
  
  // Extract attack (basic parsing that will be overridden if we find specific attack elements)
  const attackRegex = /([LFWGPDMC]+) ([^\d]+) (\d+)(.*?)Weakness:/;
  const attackMatch = text.match(attackRegex);
  if (attackMatch) {
    const attackName = attackMatch[2].trim();
    const attackDamage = attackMatch[3];
    const attackEffect = attackMatch[4].trim();
    const energyRequirement = attackMatch[1].trim();
    
    result.attacks.push({
      name: attackName,
      damage: attackDamage,
      effect: attackEffect,
      energyRequirement
    });
  }
  
  // Extract weakness
  const weaknessMatch = text.match(/Weakness: ([^R]+)/);
  if (weaknessMatch) {
    result.weakness = weaknessMatch[1].trim();
  }
  
  // Extract retreat cost
  const retreatMatch = text.match(/Retreat: (\d+)/);
  result.retreatCost = retreatMatch ? parseInt(retreatMatch[1]) : 0;
  
  // Extract special rule
  const specialRuleMatch = text.match(/ex rule: ([^I]+)/);
  if (specialRuleMatch) {
    result.specialRule = specialRuleMatch[1].trim();
  }
  
  // Extract illustrator
  const illustratorMatch = text.match(/Illustrated by (.+)$/);
  if (illustratorMatch) {
    result.illustrator = illustratorMatch[1].trim();
  }
  
  return result;
}

export async function searchCards(query: string): Promise<PokemonCard[]> {
  try {
    // Use the main search function first
    const searchResults = await searchFromWebsite(query);
    
    if (searchResults.length > 0) {
      // Add new cards to cache
      for (const card of searchResults) {
        if (!cardCache.some(c => c.id === card.id && c.setId === card.setId)) {
          cardCache.push(card);
        }
      }
      return searchResults;
    }
    
    // Fallback: search from our cache
    return cardCache.filter(card => 
      card.name.toLowerCase().includes(query.toLowerCase()) ||
      card.type.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error("Search error:", error);
    
    // Fallback to cache if the main search fails
    return cardCache.filter(card => 
      card.name.toLowerCase().includes(query.toLowerCase()) ||
      card.type.toLowerCase().includes(query.toLowerCase())
    );
  }
}

async function searchFromWebsite(query: string): Promise<PokemonCard[]> {
    try {
      // Search URL from the website
      const searchUrl = `https://pocket.limitlesstcg.com/cards?q=${(query)}`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const html = await response.text();
      const parser = new DOMParser();
      const document = parser.parseFromString(html, "text/html");
      
      if (!document) {
        throw new Error("Failed to parse HTML");
      }
      
      // Find the card search grid
      const cardGrid = document.querySelector(".card-search-grid");
      if (!cardGrid) {
        console.warn("Could not find .card-search-grid element");
        return [];
      }
      
      // Find all anchor tags within the card grid (each represents a card)
      const cardAnchors = cardGrid.querySelectorAll("a");
      console.log(`Found ${cardAnchors.length} card anchors in search results`);
      
      // Prepare to fetch full details for each card
      const cardPromises: Promise<PokemonCard | null>[] = [];
      
      for (let i = 0; i < cardAnchors.length; i++) {
        const anchor = cardAnchors[i];
        
        // Get the href which should contain the card ID and set ID
        const href = anchor.getAttribute("href") || "";
        
        // Extract setId and cardId from the URL path
        // URL format: /cards/{setId}/{cardId}
        const urlMatch = href.match(/\/cards\/([^\/]+)\/([^\/]+)/);
        if (!urlMatch) {
          console.warn(`Could not parse card URL: ${href}`);
          continue;
        }
        
        const setId = urlMatch[1];
        const cardId = urlMatch[2];
        
        // Get the card image
        const imgElement = anchor.querySelector("img");
        const imageUrl = imgElement?.getAttribute("src") || "";
        
        // Instead of creating a partial card object, fetch the full details
        cardPromises.push(fetchCardDetails(setId, cardId));
      }
      
      // Wait for all card details to be fetched
      const cards = await Promise.all(cardPromises);
      
      // Filter out any null results (cards that failed to fetch)
      const results = cards.filter(card => card !== null) as PokemonCard[];
      
      console.log(`Successfully fetched details for ${results.length} cards from search`);
      return results;
    } catch (error) {
      console.error("Search from website error:", error);
      return [];
    }
}

// Utility function to check if a card matches search criteria
export function cardMatchesSearch(card: PokemonCard, query: string): boolean {
  const searchLower = query.toLowerCase();
  
  return (
    card.name.toLowerCase().includes(searchLower) ||
    card.type.toLowerCase().includes(searchLower) ||
    (card.stage && card.stage.toLowerCase().includes(searchLower)) ||
    (card.rarity && card.rarity.toLowerCase().includes(searchLower)) ||
    card.attacks.some(attack => 
      attack.name.toLowerCase().includes(searchLower) ||
      attack.effect.toLowerCase().includes(searchLower)
    )
  );
}

// Get all cards (useful for browsing)
export async function getAllCards(page = 1, limit = 20): Promise<PokemonCard[]> {
  try {
    // URL for browsing all cards
    const browseUrl = `https://pocket.limitlesstcg.com/cards?page=${page}&limit=${limit}`;
    const response = await fetch(browseUrl);
    
    if (!response.ok) {
      throw new Error(`Browse failed: ${response.status}`);
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) {
      throw new Error("Failed to parse HTML");
    }
    
    // Use the same logic as searchFromWebsite to extract cards
    const cardElements = document.querySelectorAll(".card-browse-result");
    const results: PokemonCard[] = [];
    
    for (let i = 0; i < cardElements.length; i++) {
      const element = cardElements[i];
      
      // Extract card details from the browse result element
      const cardUrl = element.querySelector("a")?.getAttribute("href") || "";
      const imageUrl = element.querySelector("img")?.getAttribute("src") || "";
      const name = element.querySelector(".card-name")?.textContent?.trim() || "";
      const type = element.querySelector(".card-type")?.textContent?.trim() || "";
      
      // Extract setId and cardId from the URL
      const urlMatch = cardUrl.match(/\/cards\/([^\/]+)\/([^\/]+)/);
      if (!urlMatch) continue;
      
      const setId = urlMatch[1];
      const cardId = urlMatch[2];
      
      // Create a simplified card object
      results.push({
        id: cardId,
        setId,
        name,
        imageUrl,
        type,
        hp: 0,
        category: "Pokémon",
        rarity: "",
        attacks: [],
        retreatCost: 0,
      });
      
      // Add to cache
      if (!cardCache.some(c => c.id === cardId && c.setId === setId)) {
        cardCache.push(results[results.length - 1]);
      }
    }
    
    return results;
  } catch (error) {
    console.error("Get all cards error:", error);
    return [];
  }
}

// Get cards by set
export async function getCardsBySet(setId: string): Promise<PokemonCard[]> {
  try {
    const setUrl = `https://pocket.limitlesstcg.com/cards?set=${encodeURIComponent(setId)}`;
    const response = await fetch(setUrl);
    
    if (!response.ok) {
      throw new Error(`Get cards by set failed: ${response.status}`);
    }
    
    // Use the same parsing logic as getAllCards
    const html = await response.text();
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) {
      throw new Error("Failed to parse HTML");
    }
    
    // Extract cards from this set
    const cardElements = document.querySelectorAll(".card-set-result");
    const results: PokemonCard[] = [];
    
    for (let i = 0; i < cardElements.length; i++) {
      const element = cardElements[i];
      
      const cardUrl = element.querySelector("a")?.getAttribute("href") || "";
      const imageUrl = element.querySelector("img")?.getAttribute("src") || "";
      const name = element.querySelector(".card-name")?.textContent?.trim() || "";
      const type = element.querySelector(".card-type")?.textContent?.trim() || "";
      
      // Extract cardId from the URL
      const urlMatch = cardUrl.match(/\/cards\/[^\/]+\/([^\/]+)/);
      if (!urlMatch) continue;
      
      const cardId = urlMatch[1];
      
      results.push({
        id: cardId,
        setId,
        name,
        imageUrl,
        type,
        hp: 0,
        category: "Pokémon",
        rarity: "",
        attacks: [],
        retreatCost: 0,
      });
      
      // Add to cache
      if (!cardCache.some(c => c.id === cardId && c.setId === setId)) {
        cardCache.push(results[results.length - 1]);
      }
    }
    
    return results;
  } catch (error) {
    console.error("Get cards by set error:", error);
    return [];
  }
}

// Get available sets
export async function getAllSets(): Promise<{ id: string, name: string }[]> {
  try {
    const setsUrl = "https://pocket.limitlesstcg.com/sets";
    const response = await fetch(setsUrl);
    
    if (!response.ok) {
      throw new Error(`Get sets failed: ${response.status}`);
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) {
      throw new Error("Failed to parse HTML");
    }
    
    // Extract sets
    const setElements = document.querySelectorAll(".set-item");
    const results: { id: string, name: string }[] = [];
    
    for (let i = 0; i < setElements.length; i++) {
      const element = setElements[i];
      
      const setUrl = element.querySelector("a")?.getAttribute("href") || "";
      const name = element.querySelector(".set-name")?.textContent?.trim() || "";
      
      // Extract set ID from URL
      const setMatch = setUrl.match(/\/sets\/([^\/]+)/);
      if (!setMatch) continue;
      
      const id = setMatch[1];
      
      results.push({ id, name });
    }
    
    return results;
  } catch (error) {
    console.error("Get sets error:", error);
    return [];
  }
}