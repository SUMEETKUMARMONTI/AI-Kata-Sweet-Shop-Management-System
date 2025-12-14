import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Trash2, AlertCircle } from "lucide-react";
import { Header } from "@/components/header";
import { AddSweetModal } from "@/components/add-sweet-modal";
import { EditSweetModal } from "@/components/edit-sweet-modal";
import { RestockModal } from "@/components/restock-modal";
import { StockIndicator } from "@/components/stock-indicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Sweet, InsertSweet } from "@shared/schema";

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [restockingId, setRestockingId] = useState<string | null>(null);

  const sweetsQuery = useQuery<Sweet[]>({
    queryKey: ["/api/sweets"],
    enabled: isAdmin,
  });

  const addMutation = useMutation({
    mutationFn: async (data: InsertSweet) => {
      const payload = {
        name: data.name,
        category: data.category,
        price: Number(data.price),
        quantity: Number(data.quantity),
      };
      const response = await apiRequest("POST", "/api/sweets", payload);
      return response.json();
    },
    onMutate: () => setIsAdding(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      toast({
        title: "Sweet added!",
        description: `${data.name} has been added to inventory.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add sweet",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => setIsAdding(false),
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertSweet }) => {
      const payload = {
        name: data.name,
        category: data.category,
        price: Number(data.price),
        quantity: Number(data.quantity),
      };
      const response = await apiRequest("PUT", `/api/sweets/${id}`, payload);
      return response.json();
    },
    onMutate: ({ id }) => setEditingId(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      toast({
        title: "Sweet updated!",
        description: `${data.name} has been updated.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update sweet",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => setEditingId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/sweets/${id}`);
      return response.json();
    },
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      toast({
        title: "Sweet deleted",
        description: "The sweet has been removed from inventory.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete sweet",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => setDeletingId(null),
  });

  const restockMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const response = await apiRequest("POST", `/api/sweets/${id}/restock`, { amount: Number(amount) });
      return response.json();
    },
    onMutate: ({ id }) => setRestockingId(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      toast({
        title: "Stock updated!",
        description: `${data.name} now has ${data.quantity} units.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to restock",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => setRestockingId(null),
  });

  const handleAdd = async (data: InsertSweet) => {
    await addMutation.mutateAsync(data);
  };

  const handleEdit = async (id: string, data: InsertSweet) => {
    await editMutation.mutateAsync({ id, data });
  };

  const handleRestock = async (id: string, amount: number) => {
    await restockMutation.mutateAsync({ id, amount });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access the admin panel.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const sweets = sweetsQuery.data || [];
  const totalItems = sweets.length;
  const lowStockItems = sweets.filter((s) => s.quantity < 10 && s.quantity > 0).length;
  const outOfStockItems = sweets.filter((s) => s.quantity === 0).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage your sweet shop inventory
            </p>
          </div>
          <AddSweetModal onAdd={handleAdd} isAdding={isAdding} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalItems}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {lowStockItems}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Out of Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {outOfStockItems}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sweetsQuery.isLoading ? (
                    <TableSkeleton />
                  ) : sweets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No sweets in inventory. Add one to get started!
                      </TableCell>
                    </TableRow>
                  ) : (
                    sweets.map((sweet) => (
                      <TableRow key={sweet.id} data-testid={`row-sweet-${sweet.id}`}>
                        <TableCell className="font-medium">{sweet.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{sweet.category}</Badge>
                        </TableCell>
                        <TableCell>${sweet.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <StockIndicator quantity={sweet.quantity} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <RestockModal
                              sweet={sweet}
                              onRestock={handleRestock}
                              isRestocking={restockingId === sweet.id}
                            />
                            <EditSweetModal
                              sweet={sweet}
                              onEdit={handleEdit}
                              isEditing={editingId === sweet.id}
                            />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  data-testid={`button-delete-${sweet.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete {sweet.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this sweet from your inventory.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-testid="button-cancel-delete">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(sweet.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    data-testid="button-confirm-delete"
                                  >
                                    {deletingId === sweet.id ? "Deleting..." : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
