import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package } from "lucide-react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Sweet } from "@shared/schema";
import { useState } from "react";

const restockSchema = z.object({
  amount: z.number().int().min(1, "Amount must be at least 1"),
});

type RestockInput = z.infer<typeof restockSchema>;

interface RestockModalProps {
  sweet: Sweet;
  onRestock: (id: string, amount: number) => Promise<void>;
  isRestocking: boolean;
}

export function RestockModal({ sweet, onRestock, isRestocking }: RestockModalProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<RestockInput>({
    resolver: zodResolver(restockSchema),
    defaultValues: {
      amount: 10,
    },
  });

  const onSubmit = async (data: RestockInput) => {
    await onRestock(sweet.id, data.amount);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid={`button-restock-${sweet.id}`}>
          <Package className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Restock {sweet.name}</DialogTitle>
          <DialogDescription>
            Current stock: {sweet.quantity} units. Enter the amount to add.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to Add</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-restock-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-restock"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isRestocking} data-testid="button-submit-restock">
                {isRestocking ? "Restocking..." : "Restock"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
