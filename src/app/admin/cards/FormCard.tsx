
import { createCard } from "@/actions/creditCard";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Panel } from "@/components/Panel";

export function FormCard() {
  return (
    <Panel title="Registrar Tarjeta">
      <form action={createCard}>
        <div className="space-y-3">
          <Input
            name="name"
            placeholder="Nombre (Ej: Visa Platinum)"
            required
          />
          <Input name="bank" placeholder="Banco (Ej: Santander)" required />

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Input
                name="closingDay"
                label="Cierre"
                placeholder="Día"
                type="number"
                required
              />
            </div>
            <div className="space-y-1">
              <Input
                name="dueDay"
                label="Vto."
                placeholder="Día"
                type="number"
                required
              />
            </div>
          </div>

          <Button type="submit">Guardar Tarjeta</Button>
        </div>
      </form>
    </Panel>
  )
}