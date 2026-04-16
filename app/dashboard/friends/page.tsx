import { createClient } from "@/app/api/supabase/server";
import Link from "next/link";

const friendGroups = [
  {
    name: "Weekend Crew",
    members: 5,
    interests: ["Hiking", "Coffee shops", "Live music"],
    cadence: "Every Friday at 9:00 AM",
  },
  {
    name: "Study Break Squad",
    members: 3,
    interests: ["Museums", "Boba", "Board games"],
    cadence: "Tues & Thurs at 4:00 PM",
  },
  {
    name: "Family Plans",
    members: 4,
    interests: ["Parks", "Farmers markets", "Brunch"],
    cadence: "Saturdays at 10:00 AM",
  },
];

export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-white/95 dark:bg-[#2A1711] rounded-2xl shadow-lg border border-[#BB8C67]/30 dark:border-[#876047]/70 p-8 text-center max-w-sm">
          <p className="text-[#876047] dark:text-[#D9BCA6] mb-4">You must be signed in to view friends.</p>
          <Link
            href="/login"
            className="inline-flex px-5 py-2 rounded-xl bg-[#EE4D65] text-white text-sm font-medium hover:bg-[#D64058] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.18em] bg-[#EE4D65]/10 text-[#8E2537] dark:bg-[#EE4D65]/20 dark:text-[#F7A3AF] mb-3">
          Prototype preview
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#501F15] dark:text-[#F9EEE6]">Friends</h1>
        <p className="text-sm text-[#876047] dark:text-[#D9BCA6] mt-2 max-w-2xl">
          Invite friends, organize groups, and let Quokka periodically suggest activities that match shared interests
          and overlapping availability.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.25fr_1fr] gap-5 mb-8">
        <section className="rounded-2xl border border-[#BB8C67]/30 dark:border-[#876047]/70 bg-white/95 dark:bg-[#2A1711] p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#501F15] dark:text-[#F9EEE6]">Friend groups</h2>
          <p className="text-sm text-[#876047] dark:text-[#D9BCA6] mt-1 mb-4">
            Group-level preferences make recommendations feel collaborative from the start.
          </p>
          <div className="space-y-3">
            {friendGroups.map((group) => (
              <div
                key={group.name}
                className="rounded-xl border border-[#BB8C67]/25 dark:border-[#876047]/60 bg-[#FFF8F2] dark:bg-[#3A2219] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-[#501F15] dark:text-[#F9EEE6]">{group.name}</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#EE4D65]/15 text-[#8E2537] dark:bg-[#EE4D65]/25 dark:text-[#F7A3AF]">
                    {group.members} members
                  </span>
                </div>
                <p className="text-xs text-[#876047] dark:text-[#D9BCA6] mt-2">Digest cadence: {group.cadence}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {group.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#BB8C67]/20 text-[#876047] dark:bg-[#BB8C67]/20 dark:text-[#D9BCA6]"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#BB8C67]/30 dark:border-[#876047]/70 bg-white/95 dark:bg-[#2A1711] p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#501F15] dark:text-[#F9EEE6]">Invite a friend</h2>
          <p className="text-sm text-[#876047] dark:text-[#D9BCA6] mt-1 mb-4">
            Send an invite to join your next plan circle.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Friend name"
              className="w-full px-3 py-2 rounded-lg border border-[#BB8C67]/35 dark:border-[#876047]/70 bg-[#FFF8F2] dark:bg-[#3A2219] text-sm text-[#501F15] dark:text-[#F9EEE6] focus:outline-none focus:ring-2 focus:ring-[#EE4D65]"
            />
            <input
              type="email"
              placeholder="friend@email.com"
              className="w-full px-3 py-2 rounded-lg border border-[#BB8C67]/35 dark:border-[#876047]/70 bg-[#FFF8F2] dark:bg-[#3A2219] text-sm text-[#501F15] dark:text-[#F9EEE6] focus:outline-none focus:ring-2 focus:ring-[#EE4D65]"
            />
            <select className="w-full px-3 py-2 rounded-lg border border-[#BB8C67]/35 dark:border-[#876047]/70 bg-[#FFF8F2] dark:bg-[#3A2219] text-sm text-[#501F15] dark:text-[#F9EEE6] focus:outline-none focus:ring-2 focus:ring-[#EE4D65]">
              <option>Choose friend group</option>
              <option>Weekend Crew</option>
              <option>Study Break Squad</option>
              <option>Family Plans</option>
            </select>
            <button
              type="button"
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#EE4D65] text-white text-sm font-medium hover:bg-[#D64058] transition-colors"
            >
              Send invite
            </button>
            <p className="text-[11px] text-[#876047] dark:text-[#D9BCA6]">
              Demo mode: this is a UI preview. Delivery and syncing will be connected next.
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-[#BB8C67]/30 dark:border-[#876047]/70 bg-white/95 dark:bg-[#2A1711] p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#501F15] dark:text-[#F9EEE6]">Periodic group suggestions</h2>
        <p className="text-sm text-[#876047] dark:text-[#D9BCA6] mt-1 mb-4">
          Upcoming recommendation digests tailored to group overlaps.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <DigestCard title="This weekend" detail="Brunch + easy trail options for Weekend Crew" status="Queued" />
          <DigestCard title="After class" detail="2-hour indoor ideas for Study Break Squad" status="Drafting" />
          <DigestCard title="Family Sunday" detail="Kid-friendly markets and parks" status="Ready to send" />
        </div>
      </section>
    </div>
  );
}

function DigestCard({ title, detail, status }: { title: string; detail: string; status: string }) {
  return (
    <div className="rounded-xl border border-[#BB8C67]/25 dark:border-[#876047]/60 bg-[#FFF8F2] dark:bg-[#3A2219] p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium text-[#501F15] dark:text-[#F9EEE6]">{title}</h3>
        <span className="text-[11px] px-2 py-1 rounded-full bg-[#9CDE9F]/35 text-[#2E6D34] dark:bg-[#9CDE9F]/20 dark:text-[#9CDE9F]">
          {status}
        </span>
      </div>
      <p className="text-xs text-[#876047] dark:text-[#D9BCA6] mt-2">{detail}</p>
    </div>
  );
}
