import React from 'react';
export default function Sidebar({ categories, active, onPick }){
  return (
    <div className="space-y-3">
      <div className="bg-wood rounded-plank p-4">
        <div className="text-lg font-bold">Categories</div>
      </div>
      {categories.map(c=>(
        <button key={c.id} className={`card-parchment text-left transition ${active?.id===c.id?'ring-2 ring-barn-rust':''}`} onClick={()=>onPick(active?.id===c.id?null:c)}>
          <div className="font-semibold">{c.name}</div>
          <div className="text-sm text-black/60">Tap to filter</div>
        </button>
      ))}
    </div>
  );
}
