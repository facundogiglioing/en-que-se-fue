import assert from "node:assert/strict";
import { test } from "node:test";
import { getPageTitle, getUserInitials, NAV_ITEMS } from "./navigation";

test("global header names match navigation routes including card subpages", () => {
  for (const item of NAV_ITEMS) {
    assert.equal(getPageTitle(item.href), item.title);
  }
  assert.equal(
    getPageTitle("/admin/cards/test-card/202611"),
    "Tarjetas de crédito",
  );
  assert.equal(getPageTitle("/sin-acceso"), "Sin acceso");
  assert.equal(getPageTitle("/admin/cards-other"), "Home Expenses");
});

test("avatar initials handle names, extra whitespace and missing display names", () => {
  assert.equal(getUserInitials("Nombre Apellido"), "NA");
  assert.equal(getUserInitials(" Nombre  Segundo Apellido "), "NS");
  assert.equal(getUserInitials("Nombre"), "N");
  assert.equal(getUserInitials(""), "U");
});
