import SurveyForm from "@/app/ui/SurveyForm";
import { createClient } from "@/app/api/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewSurveyPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <SurveyForm recentSurvey={null} userId={user.id} />
    </div>
  );
}
