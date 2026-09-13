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
    <div className="flex min-h-0 flex-col overflow-y-auto lg:h-full lg:overflow-hidden">
      <div className="grid min-h-0 w-full grid-cols-1 lg:h-full lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="min-w-0">
          <ExpenseForm expenses={expenses} expenseId={searchParams.edit} />
        </div>
        <div className="flex min-h-0 min-w-0 flex-col border-t border-border-primary lg:border-t-0 lg:border-l">
          <ExpenseList expenses={expenses} expenseId={searchParams.edit} />
        </div>
      </div>
    </div>
  );
}
