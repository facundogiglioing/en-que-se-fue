import Image from "next/image";

const BANK_LOGOS = {
  ciudad: "/assets/bank-logos/logo-banco-ciudad.jpg",
  santander: "/assets/bank-logos/logo-banco-santander.png",
  galicia: "/assets/bank-logos/logo-banco-galicia.svg",
} as const;

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

  if (normalizedName.includes("ciudad")) {
    return BANK_LOGOS.ciudad;
  }

  if (normalizedName.includes("santander")) {
    return BANK_LOGOS.santander;
  }

  if (normalizedName.includes("galicia")) {
    return BANK_LOGOS.galicia;
  }

  return null;
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
