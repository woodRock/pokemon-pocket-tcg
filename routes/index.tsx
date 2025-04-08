// routes/index.tsx
import { Head } from "$fresh/runtime.ts";
import DeckBuilder from "../islands/DeckBuilder.tsx";
import Instructions from "../islands/Instructions.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Pokémon Pocket TCG Deck Builder</title>
        <meta name="description" content="Build and analyze your Pokémon Pocket TCG decks" />
      </Head>
      <div class="p-4 mx-auto max-w-screen-lg">
        <header class="mb-6 text-center">
          <h1 class="text-3xl font-bold">Pokémon Pocket TCG Deck Builder</h1>
          <p class="text-gray-600 mt-2">Build, analyze, and export your Pokémon Pocket TCG decks</p>
        </header>
        
        <Instructions />
        <DeckBuilder />
        
        <footer class="mt-8 pt-4 border-t text-center text-gray-500 text-sm">
          <p>This application is not affiliated with The Pokémon Company, Nintendo, or LimitlessTCG.</p>
          <p>Pokémon and all related media are trademarks of The Pokémon Company International, Inc.</p>
        </footer>
      </div>
    </>
  );
}