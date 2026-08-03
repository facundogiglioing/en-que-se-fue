type LabelProps = {
  text: string
  htmlFor: string
}
export function Label({ text, htmlFor }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xxs text-slate-500 block"
    >
      {text}
    </label>
  )
}