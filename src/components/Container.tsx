type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({ children, className = "" }: Props) {
  return <div className={`mx-auto ${className}`.trim()}>{children}</div>;
}
