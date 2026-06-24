type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className = "" }: Props) {
  return (
    <div className={`max-w-6xl mx-auto ${className}`.trim()}>{children}</div>
  );
}
