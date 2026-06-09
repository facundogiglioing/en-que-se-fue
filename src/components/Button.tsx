

type Props = {
  type: "submit" | "button" | "reset";
  variant: "primary" | "danger";
  formAction?: string | ((formData: FormData) => void | Promise<void>);
  formNoValidate?: boolean;
  children: React.ReactNode;
}

export function Button({ type, formAction, variant, formNoValidate, children }: Props) {
  return (
    <button
      type={type}
      data-variant={variant}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5
        font-bold uppercase text-xs tracking-wider 
        rounded-lg transition 
        cursor-pointer shrink-0
        
        data-[variant='danger']:bg-red-500/20 
        data-[variant='danger']:hover:bg-red-500/30 
        data-[variant='danger']:text-red-700
        
        data-[variant='primary']:bg-blue-500/20 
        data-[variant='primary']:hover:bg-blue-500/30 
        data-[variant='primary']:text-blue-700 
      `}
      formAction={formAction}
      formNoValidate={formNoValidate}
    >
      {children}
    </button>





  )

}


/**
 * 
 * 
 * <button
      type={type}
      className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-slate-200"
    >
      {children}
    </button>
 */