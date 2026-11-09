CREATE TABLE "loan_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"installment_number" integer NOT NULL,
	"paid_at" timestamp with time zone,
	"uva" numeric(14, 2) NOT NULL,
	"exchange_rate" numeric(14, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loan_payments_installmentNumber_unique" UNIQUE("installment_number")
);
