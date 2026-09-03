import { getExpenses } from "@/actions/expense";
import ExpenseForm from "./Form";
import ExpenseList from "./List";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const expenses = await getExpenses();

  return (
    <div className="flex flex-col">
      <div className="grid h-full min-h-0 w-full grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="min-w-0">
          <ExpenseForm expenses={expenses} expenseId={searchParams.edit} />
        </div>
        <div className="flex min-h-0 min-w-0 flex-col border-l border-border-primary">
          <ExpenseList expenses={expenses} expenseId={searchParams.edit} />
        </div>
      </div>



    </div>
  );
}
