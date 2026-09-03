import { Plus, X } from "lucide-react";
import Link from "next/link";

import { deleteExpense } from "@/actions/expense";

import { EntityListItem } from "@/components/EntityListItem";
import PanelHeader from "@/components/PanelHeader";
import { CATEGORIES } from "@/lib/constants";
import type { Expense } from "@/types";
import { HeaderActions } from "./Actions";

type ExpenseFormProps = {
  expenses: Expense[];
  expenseId: string | undefined;
};

export default async function ExpensesList({
  expenses,
  expenseId,
}: ExpenseFormProps) {
  return (
    <div className="flex flex-col">
      <PanelHeader
        title="Tarjetas"
        subTitle="El subtítulo"
        actions={<HeaderActions />}
      />
      <div className="flex flex-col gap-4 p-4">
        {expenses.map((expense) => {
          const Icon =
            CATEGORIES.find((c) => c.name === expense.category)?.icon || Plus;
          const isEditing = expense.id === expenseId;

          return (
            <Link key={expense.id} href={`/admin/expenses?edit=${expense.id}`}>
              <EntityListItem
                title={expense.name}
                subtitle={`${expense.category} • Día ${expense.dueDate}`}
                icon={<Icon size={20} />}
                value={`$${expense.estimatedAmount?.toLocaleString()}`}
                isActive={isEditing}
                editHref={`/admin/expenses?edit=${expense.id}`}
                onDelete={async () => {
                  "use server";
                  await deleteExpense(expense.id);
                }}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/*

 {!!cards && cards.length === 0 && <p>No hay tarjetas disponibles.</p>}
        {cards?.map((card) => (
          <EntityListItem
            key={card.id}
            title={`${card.name}`}
            subtitle={`Cierre: ${card.closingDay} -  Vto: ${card.dueDay}${card.paysInArrears ? " · Mes vencido" : ""}`}
            subtitleClassName={card.paysInArrears ? "text-amber-600 font-semibold" : undefined}
            icon={BankLogo(card.bank, 20)}
            value={card.last4Digits}
            isActive={id === card.id}
            onClick={() => {
              router.push(`/admin/cards/${card.id}/${selectedIndex}`);
            }}
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(`/admin/cards/${card.id}/${selectedIndex}`);
              }
            }}
            actions={
              <ItemActions
                onEdit={(event) => handleEditCard(event, card)}
                onDelete={(event) => handleDeleteCard(event, card.id)}
              />
            }
          />
        ))}
*/
