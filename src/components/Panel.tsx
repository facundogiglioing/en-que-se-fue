
type Props = {
  title: string;
  children: React.ReactNode;
};

export function Panel({ title, children }: Props) {

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <span className="text-xs uppercase text-slate-500 border-b border-slate-200 block pb-1">
        {title}
      </span>
      {children}
    </div>

  )
}