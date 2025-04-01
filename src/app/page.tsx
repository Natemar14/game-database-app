import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Ultimate Game Database</h1>
        <p className="mb-4">Search for games, view rules, create scoresheets, and more!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Link href="/games" className="p-4 border rounded-lg hover:bg-gray-100">
            <h2 className="text-xl font-semibold">Game Library</h2>
            <p>Browse and search our extensive game collection</p>
          </Link>
          
          <Link href="/tournaments" className="p-4 border rounded-lg hover:bg-gray-100">
            <h2 className="text-xl font-semibold">Tournaments</h2>
            <p>Create and manage game tournaments</p>
          </Link>
          
          <Link href="/series" className="p-4 border rounded-lg hover:bg-gray-100">
            <h2 className="text-xl font-semibold">Series</h2>
            <p>Organize tournaments into series</p>
          </Link>
          
          <Link href="/multiplayer" className="p-4 border rounded-lg hover:bg-gray-100">
            <h2 className="text-xl font-semibold">Multiplayer</h2>
            <p>Play games with friends online</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
