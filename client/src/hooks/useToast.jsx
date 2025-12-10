import React, { useCallback, useState } from "react";
export default function useToast(){
  const [toasts,setToasts]=useState([]);
  const push = useCallback((msg)=>{
    const id = Math.random().toString(36).slice(2);
    setToasts(t=>[...t,{id,msg}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),2200);
  },[]);
  const Toasts = () => (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 space-y-2 z-[10000]">
      {toasts.map(t=>(<div key={t.id} className="bg-wood rounded-plank px-4 py-2 shadow text-white">{t.msg}</div>))}
    </div>
  );
  return { push, Toasts };
}
