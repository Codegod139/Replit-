import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { foodEntrySchema, type InsertFoodEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import * as z from 'zod';

const units = ["grams", "ml", "scoops", "pieces"];

type FormData = Omit<InsertFoodEntry, 'imageUrl'> & {
  image: FileList;
};

export function FoodEntry({ userId, onSuccess }: { userId: number; onSuccess: () => void }) {
  const [imagePreview, setImagePreview] = useState<string>();
  const { toast } = useToast();

  const formSchema = foodEntrySchema
    .omit({ imageUrl: true })
    .extend({
      image: z.custom<FileList>((val) => val instanceof FileList, "Please upload an image").refine((files) => files.length > 0, "Image is required"),
      protein: z.number().min(0),
      calories: z.number().min(0)
    });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId,
      foodName: "",
      quantity: 0,
      unit: "grams",
      calories: 0,
      protein: 0,
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      try {
        const submitData = new FormData();
        submitData.append("image", data.image[0]);

        // Add other form fields
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'image') {
            submitData.append(key, String(value));
          }
        });

        const res = await apiRequest("POST", "/api/food-entries", submitData);
        return await res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to add food entry",
          variant: "destructive",
        });
        throw error;
      }
    },
    onSuccess: () => {
      form.reset();
      setImagePreview(undefined);
      onSuccess();
      toast({
        title: "Success",
        description: "Your food entry has been logged successfully.",
      });
    },
  });

  const calculateNutrition = (quantity: number) => {
    // Example calculation - adjust these values based on your needs
    const caloriesPerUnit = 2; // 2 calories per unit
    const proteinPerUnit = 0.1; // 0.1g protein per unit

    const calories = Math.round(quantity * caloriesPerUnit);
    const protein = Number((quantity * proteinPerUnit).toFixed(1));

    form.setValue('calories', calories, { shouldValidate: true });
    form.setValue('protein', protein, { shouldValidate: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Food Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Food Image (Required)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                          onChange(e.target.files);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="max-w-xs rounded" />
              </div>
            )}

            <FormField
              control={form.control}
              name="foodName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter food name" />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        step="any"
                        {...field}
                        onChange={(e) => {
                          const newQuantity = e.target.valueAsNumber || 0;
                          field.onChange(newQuantity);
                          calculateNutrition(newQuantity);
                        }}
                        value={field.value || ""}
                        placeholder="Enter quantity"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        {...field}
                        value={field.value || ""}
                        placeholder="Auto-calculated"
                        readOnly
                        className="bg-gray-50"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        step="0.1"
                        {...field}
                        value={field.value || ""}
                        placeholder="Auto-calculated"
                        readOnly
                        className="bg-gray-50"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Adding..." : "Add Food Entry"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}