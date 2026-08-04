import Link from "next/link";
import type { MouseEventHandler } from "react";
import type { Variants } from "@/types/general";

type Props = {
  type?: "submit" | "button" | "reset";
  variant: Variants;
  formAction?: string | ((formData: FormData) => void | Promise<void>);
  formNoValidate?: boolean;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
};

export function Button({
  type = "button",
  formAction,
  variant,
  formNoValidate,
  href,
  onClick,
  children,
}: Props) {
  const className = `
    inline-flex items-center gap-1.5 px-3 py-1.5
    font-bold uppercase text-xs tracking-wider
    rounded-lg transition
    cursor-pointer shrink-0

    data-[variant='primary']:bg-primary
    data-[variant='primary']:hover:bg-primary-hover
    data-[variant='primary']:text-primary-text

    data-[variant='success']:bg-success
    data-[variant='success']:hover:bg-success-hover
    data-[variant='success']:text-success-text

    data-[variant='danger']:bg-danger
    data-[variant='danger']:hover:bg-danger-hover
    data-[variant='danger']:text-danger-text
  `;

  if (href) {
    return (
      <Link href={href} data-variant={variant} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      data-variant={variant}
      className={className}
      formAction={formAction}
      formNoValidate={formNoValidate}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
