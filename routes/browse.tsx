// routes/browse.tsx
import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { getAllCards, getAllSets, PokemonCard } from "../utils/scraper.ts";
import CardBrowser from "../islands/CardBrowser.tsx";

interface BrowsePageData {
  cards: PokemonCard[];
  sets: { id: string; name: string }[];
  currentPage: number;
  totalPages: number;
  currentSet: string | null;
}

export const handler: Handlers<BrowsePageData> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const set = url.searchParams.get("set");
    const limit = 24; // Number of cards per page

    let totalCards = 0;
    
    let cards: PokemonCard[] = [];
    if (set) {
      // If a set is specified, get cards from that set
      const setCards = await getCardsBySet(set);
      cards = setCards.slice((page - 1) * limit, page * limit);
      totalCards = setCards.length;
    } else {
      // Otherwise, get all cards
      cards = await getAllCards(page, limit);
      totalCards = 1000; // Use a placeholder value or fetch the actual count
    }
    
    const sets = await getAllSets();
    const totalPages = Math.ceil(totalCards / limit);
    
    return ctx.render({
      cards,
      sets,
      currentPage: page,
      totalPages,
      currentSet: set
    });
  }
};

export default function Browse({ data }: PageProps<BrowsePageData>) {
  const { cards, sets, currentPage, totalPages, currentSet } = data;
  
  return (
    <>
      <Head>
        <title>Browse Cards - Pokémon Pocket TCG</title>
        <meta name="description" content="Browse and search all Pokémon Pocket TCG cards" />
      </Head>
      <div class="p-4 mx-auto max-w-screen-lg">
        <header class="mb-6">
          <h1 class="text-3xl font-bold">Browse Cards</h1>
          <p class="text-gray-600 mt-2">
            Browse and search the complete collection of Pokémon Pocket TCG cards
          </p>
        </header>
        
        <CardBrowser 
          initialCards={cards} 
          sets={sets} 
          currentPage={currentPage}
          totalPages={totalPages}
          currentSet={currentSet}
        />
        
        <footer class="mt-8 pt-4 border-t text-center text-gray-500 text-sm">
          <p>
            <a href="/" class="text-blue-500 hover:underline">
              Return to Deck Builder
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}