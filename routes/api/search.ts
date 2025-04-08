// routes/api/search.ts
import { Handlers } from "$fresh/server.ts";
import { searchCards } from "../../utils/scraper.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";
    
    if (!query) {
      return new Response(JSON.stringify([]), { 
        headers: { "Content-Type": "application/json" }
      });
    }
    
    try {
      const cards = await searchCards(query);
      
      // Log search results for debugging
      console.log(`Search for "${query}" returned ${cards.length} results`);
      
      return new Response(JSON.stringify(cards), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Search API error:", error);
      
      return new Response(JSON.stringify({ error: "Search failed", message: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};