import { Save, Trash2 } from "lucide-react";
import { deleteCard, updateCardDetails } from "@/actions/creditCard";
import { Button } from "@/components/Button";
import type { CreditCard as CreditCardType } from "@/types";

type Props = {
  card: CreditCardType;
};

type CardInputProps = {
  name: string;
  defaultValue: string | number;
  type?: string;
  min: number;
  max: number;
  fontSize?: "sm" | "md" | "lg";
};

const CardLabel = ({ label }: { label: string }) => (
  <p className=" text-xxs uppercase tracking-wider">
    {label}
  </p>
);

const CardInput = ({
  name,
  defaultValue,
  type = "text",
  min,
  max,
  fontSize = "md",
}: CardInputProps) => (
  <input
    name={name}
    type={type}
    min={min}
    max={max}
    defaultValue={defaultValue}
    required
    data-font-size={fontSize}
    className={`
      pl-1
      w-full text-black focus:outline-none 
      border-b border-transparent focus:border-white/40 
      placeholder:text-white/30 transition
      [appearance:textfield] 
      [&::-webkit-outer-spin-button]:appearance-none
      [&::-webkit-inner-spin-button]:appearance-none
      data-[font-size="sm"]:text-xxs
      data-[font-size="md"]:text-base
      data-[font-size="lg"]:text-lg
      
    `}
  />
);

export function Card({ card }: Props) {
  return (
    <div className="border-2 bg-gray-100 border-gray-400 rounded-2xl shadow-xl max-w-md ">
      <form action={updateCardDetails}>
        <input type="hidden" name="cardId" value={card.id} />

        <div className="flex flex-col justify-between h-45 m-7">
          <div className="flex flex-row">
            <div>
              <CardLabel label="Banco" />
              <input
                name="bank"
                defaultValue={card.bank}
                required
                placeholder="Banco"
                className="bg-transparent text-black font-bold text-xl w-full focus:outline-none border-b border-transparent focus:border-white/40 placeholder:text-white/30 transition"
              />
            </div>

            <div className="w-full flex items-start justify-end gap-3">
              <Button
                type="submit"
                variant="primary"
              >
                <Save size={18} />
              </Button>
              <Button
                type="submit"
                variant="danger"
                formAction={deleteCard.bind(null, card.id)}
                formNoValidate
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
          <div>
            <div>
              #### - #### - #### - {card.last4Digits}
            </div>
            <div className="flex flex-row items-center" >
              <CardLabel label="Cierre:" />
              <CardInput
                name="closingDay"
                type="number"
                min={1}
                max={31}
                defaultValue={card.closingDay}
                fontSize="sm"
              />
              <CardLabel label="Vto:" />
              <CardInput
                name="dueDay"
                type="number"
                min={1}
                max={31}
                defaultValue={card.dueDay}
                fontSize="sm"
              />
            </div>
            <input
              name="name"
              defaultValue={card.name}
              required
              placeholder="Nombre de la tarjeta"
              className="bg-transparent text-black font-bold text-xl w-full focus:outline-none border-b border-transparent focus:border-white/40 placeholder:text-white/30 transition"
            />

          </div>
        </div>
      </form>
    </div>
  );
}


