import assert from "node:assert/strict";
import { test } from "node:test";
import { bancoCiudadParser } from "./banco-ciudad";

test("includes Banco Ciudad movements across repeated page sections", () => {
  const statement = [
    "DETALLE DEL MES",
    "01-Oct-26 COMPRA PRIMERA 100,00",
    "TOTAL TITULAR 100,00",
    "DETALLE DEL MES",
    "02-Oct-26 COMPRA SEGUNDA 200,00",
    "TOTAL TITULAR 300,00",
  ].join("\n");

  const parsed = bancoCiudadParser.parse(statement);

  assert.deepEqual(
    parsed.movements.map(({ description, amountArs }) => ({
      description,
      amountArs,
    })),
    [
      { description: "COMPRA PRIMERA", amountArs: 100 },
      { description: "COMPRA SEGUNDA", amountArs: 200 },
    ],
  );
});

test("returns no Banco Ciudad movements when the detail section is missing", () => {
  const statement = [
    "01-Oct-26 COMPRA FUERA DEL DETALLE 100,00",
    "TOTAL TITULAR 100,00",
  ].join("\n");

  assert.deepEqual(bancoCiudadParser.parse(statement).movements, []);
});
