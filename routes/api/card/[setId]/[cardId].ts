// routes/api/card/[setId]/[cardId].ts
import { Handlers } from "$fresh/server.ts";
import { fetchCardDetails } from "../../../../utils/scraper.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const { setId, cardId } = ctx.params;
    
    try {
      const card = await fetchCardDetails(setId, cardId);
      
      if (!card) {
        return new Response(JSON.stringify({ error: "Card not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      return new Response(JSON.stringify(card), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error(`Error fetching card ${setId}/${cardId}:`, error);
      
      return new Response(JSON.stringify({ error: "Failed to fetch card" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};