"use client";

import { useEffect, useMemo, useState } from "react";
import type { Activity } from "@/app/lib/openai";

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const SLOT_MINUTES = 30;
const MINUTES_IN_VIEW = (DAY_END_HOUR - DAY_START_HOUR) * 60;
const CALENDAR_HEIGHT = 720;
const PX_PER_MINUTE = CALENDAR_HEIGHT / MINUTES_IN_VIEW;

type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  link: string;
  start: Date;
  end: Date;
};

interface Props {
  activities: Activity[];
}

type ResizeState = {
  eventId: string;
  edge: "start" | "end";
  startClientY: number;
  originalStartMs: number;
  originalEndMs: number;
};

export default function SuggestedCalendar({ activities }: Props) {
  const weekStart = useMemo(() => getStartOfWeek(new Date()), []);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizing, setResizing] = useState<ResizeState | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(() => buildSuggestedEvents(activities, weekStart));

  useEffect(() => {
    setEvents(buildSuggestedEvents(activities, weekStart));
  }, [activities, weekStart]);

  useEffect(() => {
    if (!resizing) return;

    const onMouseMove = (event: MouseEvent) => {
      const deltaPixels = event.clientY - resizing.startClientY;
      const snappedMinutes =
        Math.round(deltaPixels / (SLOT_MINUTES * PX_PER_MINUTE)) * SLOT_MINUTES;
      const originalStart = new Date(resizing.originalStartMs);
      const originalEnd = new Date(resizing.originalEndMs);
      const dayStart = new Date(originalStart);
      dayStart.setHours(DAY_START_HOUR, 0, 0, 0);
      const dayEnd = new Date(originalStart);
      dayEnd.setHours(DAY_END_HOUR, 0, 0, 0);

      setEvents((previous) =>
        previous.map((item) => {
          if (item.id !== resizing.eventId) return item;

          if (resizing.edge === "start") {
            const candidateStart = new Date(originalStart.getTime() + snappedMinutes * 60000);
            const maxStart = new Date(originalEnd.getTime() - SLOT_MINUTES * 60000);
            const nextStart = clampDate(candidateStart, dayStart, maxStart);
            return { ...item, start: nextStart, end: new Date(originalEnd) };
          }

          const candidateEnd = new Date(originalEnd.getTime() + snappedMinutes * 60000);
          const minEnd = new Date(originalStart.getTime() + SLOT_MINUTES * 60000);
          const nextEnd = clampDate(candidateEnd, minEnd, dayEnd);
          return { ...item, start: new Date(originalStart), end: nextEnd };
        }),
      );
    };

    const onMouseUp = () => {
      setResizing(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [resizing]);

  const handleExportIcs = () => {
    if (events.length === 0) return;
    const blob = new Blob([buildIcsContent(events)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "quokka-suggested-activities.ics";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, day: Date) => {
    event.preventDefault();
    const eventId = event.dataTransfer.getData("text/plain");
    if (!eventId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = clamp(event.clientY - rect.top, 0, CALENDAR_HEIGHT);

    setEvents((previous) => {
      const existing = previous.find((item) => item.id === eventId);
      if (!existing) return previous;

      const durationMinutes = Math.round((existing.end.getTime() - existing.start.getTime()) / 60000);
      const snappedMinutes = clamp(
        Math.round(offsetY / (SLOT_MINUTES * PX_PER_MINUTE)) * SLOT_MINUTES,
        0,
        MINUTES_IN_VIEW - durationMinutes,
      );

      const nextStart = new Date(day);
      nextStart.setHours(DAY_START_HOUR, 0, 0, 0);
      nextStart.setMinutes(nextStart.getMinutes() + snappedMinutes);
      const nextEnd = new Date(nextStart.getTime() + durationMinutes * 60000);

      return previous.map((item) =>
        item.id === eventId
          ? {
              ...item,
              start: nextStart,
              end: nextEnd,
            }
          : item,
      );
    });

    setDraggingId(null);
  };

  return (
    <div className="mb-10 rounded-2xl border border-[#BB8C67]/30 dark:border-[#876047]/70 bg-white/95 dark:bg-[#2A1711] p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[#501F15] dark:text-[#F9EEE6]">Calendar preview (beta)</h2>
          <p className="text-sm text-[#876047] dark:text-[#D9BCA6] mt-1">
            Drag activities across the week to adjust your plan.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportIcs}
          disabled={events.length === 0}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#501F15] text-[#FFF8F2] text-sm font-medium hover:bg-[#6A2A1F] transition-colors disabled:opacity-50"
        >
          Export .ics
        </button>
      </div>

      <div className="mb-4 rounded-xl border border-[#BB8C67]/25 dark:border-[#876047]/60 bg-[#FFF8F2] dark:bg-[#3A2219] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8E2537] dark:text-[#F7A3AF]">
          Friend group sync coming soon
        </p>
        <p className="text-xs text-[#876047] dark:text-[#D9BCA6] mt-1">
          Soon, Quokka will auto-sync this schedule to your friend groups and send shared activity digests based on
          overlapping interests and availability.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#BB8C67]/25 dark:border-[#876047]/60">
        <div className="min-w-[1020px]">
          <div className="grid grid-cols-[72px_repeat(7,minmax(130px,1fr))] border-b border-[#BB8C67]/25 dark:border-[#876047]/60 bg-[#FFF8F2] dark:bg-[#3A2219]">
            <div className="p-2" />
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="px-2 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#876047] dark:text-[#D9BCA6]">
                  {day.toLocaleDateString([], { weekday: "short" })}
                </p>
                <p className="text-sm font-semibold text-[#501F15] dark:text-[#F9EEE6]">
                  {day.toLocaleDateString([], { month: "short", day: "numeric" })}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[72px_repeat(7,minmax(130px,1fr))] bg-[#FFF8F2] dark:bg-[#3A2219]">
            <div className="relative border-r border-[#BB8C67]/25 dark:border-[#876047]/60">
              {Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, index) => {
                const hour = DAY_START_HOUR + index;
                return (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 pr-2 text-right text-[11px] text-[#876047] dark:text-[#D9BCA6]"
                    style={{ top: `${index * 60 * PX_PER_MINUTE - 7}px` }}
                  >
                    {formatHour(hour)}
                  </div>
                );
              })}
            </div>

            {weekDays.map((day) => {
              const dayEvents = events.filter((item) => isSameDay(item.start, day));

              return (
                <div
                  key={day.toISOString()}
                  className="relative border-r last:border-r-0 border-[#BB8C67]/25 dark:border-[#876047]/60"
                  style={{ height: `${CALENDAR_HEIGHT}px` }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, day)}
                >
                  {Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, index) => (
                    <div
                      key={index}
                      className="absolute left-0 right-0 border-t border-[#BB8C67]/20 dark:border-[#876047]/50"
                      style={{ top: `${index * 60 * PX_PER_MINUTE}px` }}
                    />
                  ))}

                  {dayEvents.map((item) => {
                    const minutesFromDayStart = clamp(
                      (item.start.getHours() - DAY_START_HOUR) * 60 + item.start.getMinutes(),
                      0,
                      MINUTES_IN_VIEW - 30,
                    );
                    const rawDuration = Math.round((item.end.getTime() - item.start.getTime()) / 60000);
                    const duration = clamp(rawDuration, 30, MINUTES_IN_VIEW - minutesFromDayStart);
                    return (
                      <div
                        key={item.id}
                        draggable={!resizing}
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", item.id);
                          setDraggingId(item.id);
                        }}
                        onDragEnd={() => setDraggingId(null)}
                        className={`absolute left-1.5 right-1.5 rounded-lg border border-[#EE4D65]/35 bg-[#EE4D65]/15 dark:bg-[#EE4D65]/25 px-2 py-1.5 shadow-sm cursor-grab active:cursor-grabbing ${
                          draggingId === item.id ? "opacity-60" : "opacity-100"
                        }`}
                        style={{
                          top: `${minutesFromDayStart * PX_PER_MINUTE}px`,
                          height: `${Math.max(duration * PX_PER_MINUTE, 48)}px`,
                        }}
                        title={item.description}
                      >
                        <button
                          type="button"
                          aria-label={`Adjust start time for ${item.title}`}
                          className="absolute left-2 right-2 top-1 h-1.5 rounded-full bg-[#8E2537]/35 dark:bg-[#F7A3AF]/45 cursor-ns-resize"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setResizing({
                              eventId: item.id,
                              edge: "start",
                              startClientY: event.clientY,
                              originalStartMs: item.start.getTime(),
                              originalEndMs: item.end.getTime(),
                            });
                          }}
                        />
                        <p className="text-xs font-semibold text-[#8E2537] dark:text-[#F7A3AF] line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#8E2537]/90 dark:text-[#F7A3AF] mt-0.5">
                          {formatTimeRange(item.start, item.end)}
                        </p>
                        <button
                          type="button"
                          aria-label={`Adjust end time for ${item.title}`}
                          className="absolute left-2 right-2 bottom-1 h-1.5 rounded-full bg-[#8E2537]/35 dark:bg-[#F7A3AF]/45 cursor-ns-resize"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setResizing({
                              eventId: item.id,
                              edge: "end",
                              startClientY: event.clientY,
                              originalStartMs: item.start.getTime(),
                              originalEndMs: item.end.getTime(),
                            });
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildSuggestedEvents(activities: Activity[], weekStart: Date): CalendarEvent[] {
  const plannedHours = [18, 18, 19, 18, 19, 11, 12];
  const plannedDurations = [90, 90, 120, 90, 120, 120, 120];

  return activities.slice(0, 7).map((activity, index) => {
    const day = addDays(weekStart, index);
    const start = new Date(day);
    const hour = plannedHours[index] ?? 18;
    const requestedDuration = plannedDurations[index] ?? 90;
    start.setHours(hour, 0, 0, 0);
    const startMinutes = (start.getHours() - DAY_START_HOUR) * 60 + start.getMinutes();
    const maxDuration = Math.max(30, MINUTES_IN_VIEW - Math.max(0, startMinutes));
    const durationMinutes = clamp(requestedDuration, 30, maxDuration);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    return {
      id: `${index}-${slugify(activity.name)}`,
      title: activity.name,
      description: activity.description,
      link: activity.link,
      start,
      end,
    };
  });
}

function buildIcsContent(events: CalendarEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Quokka//Suggested Activities//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  const dtStamp = formatUtcDate(new Date());

  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

  for (const event of sortedEvents) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id.replace(/\s+/g, "-").toLowerCase()}@quokka.app`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART:${formatUtcDate(event.start)}`);
    lines.push(`DTEND:${formatUtcDate(event.end)}`);
    lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
    if (event.link) {
      lines.push(`URL:${event.link}`);
    }
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

function formatUtcDate(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  const hours = String(value.getUTCHours()).padStart(2, "0");
  const minutes = String(value.getUTCMinutes()).padStart(2, "0");
  const seconds = String(value.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeIcsText(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatTimeRange(start: Date, end: Date): string {
  return `${start.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })} - ${end.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function getStartOfWeek(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  const day = value.getDay();
  const daysSinceMonday = (day + 6) % 7;
  value.setDate(value.getDate() - daysSinceMonday);
  return value;
}

function addDays(date: Date, days: number): Date {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatHour(hour24: number): string {
  const date = new Date();
  date.setHours(hour24, 0, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric" });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function clampDate(value: Date, min: Date, max: Date): Date {
  const clampedMs = clamp(value.getTime(), min.getTime(), max.getTime());
  return new Date(clampedMs);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
