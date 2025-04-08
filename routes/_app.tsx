// routes/_app.tsx
import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Pokémon Pocket TCG</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" />
        <link rel="icon" type="image/png" href="/favicon.svg" />
        <meta name="description" content="Build, analyze, and share your Pokémon Pocket TCG decks" />
      </head>
      <body class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 font-sans antialiased">
        {/* Decorative elements */}
        <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Top-left Pokeball shape */}
          <div class="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-red-500 opacity-10"></div>
          <div class="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-white opacity-20"></div>
          <div class="absolute -top-16 -left-16 w-32 h-32 rounded-full border-2 border-gray-800 opacity-5"></div>
          
          {/* Bottom-right Pokeball shape */}
          <div class="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-red-500 opacity-10"></div>
          <div class="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-white opacity-20"></div>
          <div class="absolute -bottom-16 -right-16 w-32 h-32 rounded-full border-2 border-gray-800 opacity-5"></div>
          
          {/* Energy symbols scattered */}
          <div class="absolute top-1/4 right-10 w-12 h-12 rounded-full bg-yellow-400 opacity-20 transform rotate-12"></div>
          <div class="absolute top-1/3 left-16 w-8 h-8 rounded-full bg-blue-400 opacity-20 transform -rotate-12"></div>
          <div class="absolute bottom-1/4 left-12 w-10 h-10 rounded-full bg-red-400 opacity-20 transform rotate-45"></div>
          <div class="absolute top-2/3 right-20 w-14 h-14 rounded-full bg-green-400 opacity-15 transform -rotate-20"></div>
          
          {/* Subtle grid pattern */}
          <div class="absolute inset-0 bg-graph-paper opacity-5"></div>
        </div>
        
        {/* Navigation header */}
        <header class="sticky top-0 z-50 bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
              <div class="flex items-center">
                <a href="/" class="flex items-center">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                    <div class="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <span class="ml-2 text-xl font-bold text-gray-800">Pokémon Pocket TCG</span>
                </a>
              </div>
              <nav>
                <ul class="flex space-x-8">
                  <li>
                    <a href="/" class="text-gray-700 hover:text-blue-600 font-medium transition">
                      Deck Builder
                    </a>
                  </li>
                  <li>
                    <a href="/browse" class="text-gray-700 hover:text-blue-600 font-medium transition">
                      Browse Cards
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main class="relative z-10 pt-6 pb-12">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Component />
          </div>
        </main>
        
        {/* Footer */}
        <footer class="relative z-10 border-t border-gray-200 bg-white bg-opacity-70">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex flex-col md:flex-row justify-between items-center">
              <p class="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Pokémon Pocket TCG Deck Builder
              </p>
              <p class="text-xs text-gray-400 mt-2 md:mt-0">
                This application is not affiliated with The Pokémon Company or Nintendo.
                Pokémon and all related media are trademarks of The Pokémon Company International, Inc.
              </p>
            </div>
          </div>
        </footer>
        
        {/* Custom styles */}
        <style>{`
          /* Custom background pattern */
          .bg-graph-paper {
            background-image: 
              linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
            background-size: 20px 20px;
          }
          
          /* Font settings */
          html {
            font-family: 'Montserrat', system-ui, sans-serif;
          }
          
          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }
          
          /* Custom card hover effects */
          a:hover img {
            transform: translateY(-2px);
            transition: transform 0.2s ease-in-out;
          }
        `}</style>
      </body>
    </html>
  );
}