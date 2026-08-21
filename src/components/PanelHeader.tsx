
type PanelHeaderProps = {
  title: string;
  subTitle?: string;
  actions?: React.ReactNode;
};

export default function PanelHeader({
  title,
  subTitle,
  actions
}: PanelHeaderProps) {
  return (
    <div className="p-4 border-b border-border-primary flex flex-wrap justify-between items-center">
      <div>
        <h3 className="font-bold uppercase tracking-widest text-slate-700">
          {title}
        </h3>

        <p className="text-xs text-slate-400 mt-0.5">
          {subTitle} &nbsp;
        </p>

      </div>
      <div className="flex items-center gap-2">
        {actions}
      </div>
    </div>
  );
}