import { createClient } from "@/app/api/supabase/server";
import Link from "next/link";
import ResultsList from "@/app/ui/ResultsList"; // client component

export const dynamic = "force-dynamic"; // ensure SSR runs on every request

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ surveyId?: string }>;
}) {
  const supabase = await createClient();

  // Get current user (auth id from session)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  console.log("RESULTS USER:", user?.id);


  if (userError || !user) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">You must be signed in to view your results.</p>
        <Link
          href="/login"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const params = await searchParams;

  // Fetch this user's most recent survey (or the one specified in the URL)
  // Surveys table has: id, user_id, hobbies, zip_code — activities are in survey_activities
  let surveyQuery = supabase
    .from("surveys")
    .select("id, hobbies, zip_code")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (params?.surveyId) {
    surveyQuery = supabase
      .from("surveys")
      .select("id, hobbies, zip_code")
      .eq("user_id", user.id)
      .eq("id", params.surveyId)
      .limit(1);
  }

  const { data: surveys, error: surveyError } = await surveyQuery;

  if (surveyError || !surveys || surveys.length === 0) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">No survey found for this user.</p>
        <Link
          href="/"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Fill out a survey
        </Link>
      </div>
    );
  }

  const survey = surveys[0];

  // Activities are stored in survey_activities (keyed by survey_id), not on surveys
  const { data: surveyActivities } = await supabase
    .from("survey_activities")
    .select("activities")
    .eq("survey_id", survey.id)
    .maybeSingle();

  let activities = surveyActivities?.activities ?? [];

  // If no activities yet (e.g. first time viewing this survey), generate and cache them
  if (activities.length === 0) {
    try {
      const { generateActivities } = await import("@/app/lib/openai");
      activities = await generateActivities({
        hobbies: survey.hobbies,
        zipCode: survey.zip_code,
      });
      await supabase.from("survey_activities").insert([
        {
          user_id: user.id,
          survey_id: survey.id,
          activities,
          openai_model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        },
      ]);
    } catch (err) {
      console.error("Failed to generate or cache activities:", err);
      return (
        <div className="text-center mt-10">
          <p className="text-red-500">
            We couldn’t load your activity suggestions. Please try again or fill out a new survey.
          </p>
          <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to survey
          </Link>
        </div>
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ResultsList
        survey={{
          id: survey.id,
          hobbies: survey.hobbies,
          zip: survey.zip_code,
          activities: Array.isArray(activities) ? activities : [],
        }}
      />
    </div>
  );
}
