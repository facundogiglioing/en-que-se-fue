import { getExpenses } from "@/actions/expense";
import { requireRoles } from "@/lib/auth-session";
import { ROLES } from "@/lib/roles";
import ExpenseForm from "./Form";
import ExpenseList from "./List";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireRoles([ROLES.ADMIN]);
  const expenses = await getExpenses();
  const { edit } = await searchParams;

  return (
    <div className="flex min-h-0 flex-col overflow-y-auto lg:h-full lg:overflow-hidden">
      <div className="grid min-h-0 w-full grid-cols-1 lg:h-full lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:grid-rows-[minmax(0,1fr)]">
        <div className="min-w-0">
          <ExpenseForm expenses={expenses} expenseId={edit} />
        </div>
        <div className="flex min-h-0 min-w-0 flex-col border-t border-border-primary lg:border-t-0 lg:border-l">
          <ExpenseList expenses={expenses} expenseId={edit} />
        </div>
      </div>
    </div>
  );
}
