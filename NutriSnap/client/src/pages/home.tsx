import { useQuery } from "@tanstack/react-query";
import { DailyTracker } from "@/components/daily-tracker";
import { FoodEntry } from "@/components/food-entry";
import type { User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users/1"],
    onError: () => {
      setLocation("/profile");
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto pt-20 px-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <DailyTracker user={user} />
        </div>
        <div>
          <FoodEntry 
            userId={user.id} 
            onSuccess={() => {
              // Invalidate the food entries query
              queryClient.invalidateQueries({ 
                queryKey: [`/api/users/${user.id}/food-entries`]
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
