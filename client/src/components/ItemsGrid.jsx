import React from 'react';
import ItemCard from './ItemCard.jsx';
console.log(">>> ItemCard LOADED FROM:", import.meta.url);

export default function ItemsGrid({ items, onAdd }){
  return (
    <section>
      <div className="text-xl font-bold mb-3">Items</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(i=>(<ItemCard key={i.id} item={i} onAdd={()=>onAdd(i)} />))}
      </div>
    </section>
  );
}
