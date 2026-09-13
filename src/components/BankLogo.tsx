import Image from "next/image";
import { BANKS } from "@/lib/constants";

const BANK_LOGO_FILES: Record<(typeof BANKS)[number], string> = {
  Santander: "logo-banco-santander.png",
  Galicia: "logo-banco-galicia.png",
  Ciudad: "logo-banco-ciudad.png",
  Patagonia: "logo-banco-patagonia.png",
};

const normalizeBankName = (bankName: string): string => {
  return bankName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

const getBankLogoSrc = (bankName: string): string | null => {
  const normalizedName = normalizeBankName(bankName);
  const match = BANKS.find((bank) => normalizedName.includes(normalizeBankName(bank)));

  if (!match) {
    return null;
  }

  return `/assets/bank-logos/${BANK_LOGO_FILES[match]}`;
};

export const BankLogo = (bankName: string, size = 24) => {
  const src = getBankLogoSrc(bankName);

  if (!src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={bankName}
      width={size}
      height={size}
      className="h-auto w-auto object-contain"
    />
  );
};
