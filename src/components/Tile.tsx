export default function Tile({icon, title, onClick}:{icon:string; title:string; onClick?:()=>void}) {
  return (
    <button
      onClick={onClick}
      className="aspect-[3/2] rounded-2xl bg-white border border-slate-200 shadow-sm
                 active:scale-[0.99] transition flex flex-col items-center justify-center gap-2">
      <div className="text-4xl leading-none">{icon}</div>
      <div className="text-sm font-medium text-slate-800">{title}</div>
    </button>
  )
}
