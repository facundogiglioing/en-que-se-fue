CREATE TABLE "card_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"is_paid" boolean DEFAULT true NOT NULL,
	"paid_at" timestamp with time zone,
	"actual_amount" numeric(14, 2),
	CONSTRAINT "card_payments_cardId_month_year_unique" UNIQUE("card_id","month","year")
);
--> statement-breakpoint
CREATE TABLE "credit_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"bank" text NOT NULL,
	"closing_day" integer NOT NULL,
	"due_day" integer NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"last4_digits" text NOT NULL,
	"pays_in_arrears" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"due_date" integer NOT NULL,
	"estimated_amount" numeric(14, 2),
	"electronic_payment_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "income_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"income_id" uuid NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"is_received" boolean DEFAULT true NOT NULL,
	"received_at" timestamp with time zone,
	CONSTRAINT "income_receipts_incomeId_month_year_unique" UNIQUE("income_id","month","year")
);
--> statement-breakpoint
CREATE TABLE "incomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"expected_amount" numeric(14, 2) NOT NULL,
	"expected_day" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expense_id" uuid NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"is_paid" boolean DEFAULT true NOT NULL,
	"paid_at" timestamp with time zone,
	"actual_amount" numeric(14, 2),
	CONSTRAINT "payments_expenseId_month_year_unique" UNIQUE("expense_id","month","year")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"description" text NOT NULL,
	"total_amount" numeric(14, 2) NOT NULL,
	"installments" integer DEFAULT 1 NOT NULL,
	"start_month" integer NOT NULL,
	"start_year" integer NOT NULL,
	"category" text NOT NULL,
	"receipt_number" text,
	"movement_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "card_payments" ADD CONSTRAINT "card_payments_card_id_credit_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."credit_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income_receipts" ADD CONSTRAINT "income_receipts_income_id_incomes_id_fk" FOREIGN KEY ("income_id") REFERENCES "public"."incomes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_card_id_credit_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."credit_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_card_id_index" ON "transactions" USING btree ("card_id");