import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { userSchema, type User } from "@shared/schema";
import { useLocation } from "wouter";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/users/1"],
  });

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      age: user?.age ?? 0,
      gender: user?.gender ?? "",
      dailyCalorieTarget: user?.dailyCalorieTarget ?? 2000,
      dailyProteinTarget: user?.dailyProteinTarget ?? 50,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const formattedData = {
        ...data,
        age: Number(data.age),
        dailyCalorieTarget: Number(data.dailyCalorieTarget),
        dailyProteinTarget: Number(data.dailyProteinTarget),
      };

      if (user) {
        const res = await apiRequest("PUT", `/api/users/${user.id}`, formattedData);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/users", formattedData);
        return res.json();
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/users/1"], data);
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
      setLocation("/");
    },
  });

  return (
    <div className="container mx-auto pt-20 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dailyCalorieTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Calorie Target</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dailyProteinTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Protein Target (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}