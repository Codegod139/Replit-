import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import type { User, FoodEntry } from "@shared/schema";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DailyTracker({ user }: { user: User }) {
  const { data: entries } = useQuery<FoodEntry[]>({
    queryKey: [`/api/users/${user.id}/food-entries`, { 
      since: new Date().toISOString().split('T')[0] 
    }],
  });

  const totalCalories = entries?.reduce((sum, entry) => sum + entry.calories, 0) || 0;
  const totalProtein = entries?.reduce((sum, entry) => sum + entry.protein, 0) || 0;

  const calorieProgress = Math.min((totalCalories / user.dailyCalorieTarget) * 100, 100);
  const proteinProgress = Math.min((totalProtein / user.dailyProteinTarget) * 100, 100);

  const showWarning = totalCalories > user.dailyCalorieTarget;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Daily Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Calories</span>
                <span>{totalCalories} / {user.dailyCalorieTarget} kcal</span>
              </div>
              <Progress value={calorieProgress} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Protein</span>
                <span>{totalProtein} / {user.dailyProteinTarget} g</span>
              </div>
              <Progress value={proteinProgress} />
            </div>
          </div>
        </CardContent>
      </Card>

      {showWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You have exceeded your daily calorie target!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
