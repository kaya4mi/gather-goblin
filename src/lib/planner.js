export const VIBES = [
  { id: "chill", label: "Cozy & chill", icon: "☁" },
  { id: "food", label: "Food & friends", icon: "🍜" },
  { id: "creative", label: "Get creative", icon: "✿" },
  { id: "active", label: "A little adventure", icon: "✧" },
];
export const CURRENCIES = ["JPY", "USD", "CNY", "EUR"];
export const STORAGE_KEY = "gather-goblin:plans:v1";
export const MAX_PLANS = 20;

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function emptyForm() {
  return {
    title: "",
    place: "",
    date: localDate(),
    time: "14:00",
    guests: "4",
    budget: "3000",
    currency: "JPY",
    duration: "3",
    setting: "indoor",
    vibes: ["chill"],
    notes: "",
  };
}
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && localDate(date) === value;
}
export function validateForm(form, { allowPast = false } = {}) {
  const errors = {};
  if (
    typeof form.title !== "string" ||
    !form.title.trim() ||
    form.title.length > 80
  )
    errors.title = "Give your gathering a name (up to 80 characters).";
  if (
    typeof form.place !== "string" ||
    !form.place.trim() ||
    form.place.length > 160
  )
    errors.place =
      "Add a city, neighborhood, or meeting place (up to 160 characters).";
  if (!validDate(form.date) || (!allowPast && form.date < localDate()))
    errors.date = "Choose today or a future date.";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.time))
    errors.time = "Choose a valid start time.";
  if (
    !/^\d+$/.test(String(form.guests)) ||
    Number(form.guests) < 2 ||
    Number(form.guests) > 30
  )
    errors.guests = "Choose between 2 and 30 people.";
  if (
    !["string", "number"].includes(typeof form.budget) ||
    String(form.budget).trim() === "" ||
    !Number.isFinite(Number(form.budget)) ||
    Number(form.budget) < 0 ||
    Number(form.budget) > 1000000 ||
    !Number.isInteger(Number(form.budget))
  )
    errors.budget = "Enter a whole amount from 0 to 1,000,000 per person.";
  if (!CURRENCIES.includes(form.currency))
    errors.currency = "Choose a supported currency.";
  if (!["2", "3", "4", "6"].includes(String(form.duration)))
    errors.duration = "Choose a duration from the list.";
  if (!["indoor", "outdoor"].includes(form.setting))
    errors.setting = "Choose indoors or outdoors.";
  if (
    !Array.isArray(form.vibes) ||
    !form.vibes.length ||
    form.vibes.some((vibe) => !VIBES.some((item) => item.id === vibe))
  )
    errors.vibes = "Pick at least one vibe.";
  if (typeof form.notes !== "string" || form.notes.length > 500)
    errors.notes = "Keep notes within 500 characters.";
  return errors;
}
const activities = {
  indoor: {
    chill: [
      [
        "Cozy board-game club",
        "Bring a favorite game or play a free word game. Team up so everyone can join.",
      ],
      [
        "Music & memories",
        "Make a shared playlist and trade the stories behind your favorite songs.",
      ],
    ],
    food: [
      [
        "Recipe swap & snack tasting",
        "Bring snacks from home and swap easy recipes. Check everyone’s dietary needs first.",
      ],
      [
        "Build-your-own snack table",
        "Everyone brings something to the table. Label ingredients and keep the setup simple.",
      ],
    ],
    creative: [
      [
        "Tiny craft studio",
        "Bring paper and supplies you already own. Make postcards for each other.",
      ],
      [
        "Draw your friends challenge",
        "Use scrap paper for quick portraits, then reveal your tiny masterpieces together.",
      ],
    ],
    active: [
      [
        "Living-room mini challenges",
        "Try gentle charades and team puzzles. Keep movement optional and leave space to sit.",
      ],
      [
        "Team trivia tournament",
        "Write questions for each other and run a friendly, no-stakes quiz.",
      ],
    ],
  },
  outdoor: {
    chill: [
      [
        "Slow stroll & people watching",
        "Choose a short, accessible public route with benches. Take breaks together.",
      ],
      [
        "Blanket & book hangout",
        "Bring a blanket and a favorite book to share in a suitable public green space.",
      ],
    ],
    food: [
      [
        "Bring-your-own picnic",
        "Pack food from home, label ingredients, and leave the space as you found it.",
      ],
      [
        "Snack swap in the sunshine",
        "Meet in a suitable public spot and share homemade snacks after checking dietary needs.",
      ],
    ],
    creative: [
      [
        "Little photo scavenger hunt",
        "Look for colors, textures, and tiny details. Use your phones and share your favorite shots.",
      ],
      [
        "Sketch the neighborhood",
        "Bring paper and pencils for a relaxed drawing session at an accessible public spot.",
      ],
    ],
    active: [
      [
        "Neighborhood discovery walk",
        "Choose a short public route together. Keep the pace flexible and allow seated breaks.",
      ],
      [
        "Gentle park games",
        "Bring a ball or try simple team challenges where permitted. Make every activity optional.",
      ],
    ],
  },
};
export function generatePlan(form, variation = 0) {
  if (Object.keys(validateForm(form)).length)
    throw new Error("Please check the gathering details.");
  const input = {
    ...form,
    title: form.title.trim(),
    place: form.place.trim(),
    notes: form.notes.trim(),
    vibes: [...form.vibes],
  };
  const vibe = input.vibes[variation % input.vibes.length];
  const choices = activities[input.setting][vibe];
  const [activityTitle, activityNotes] =
    choices[Math.floor(variation / input.vibes.length) % choices.length];
  const minutes = Number(input.duration) * 60;
  const first = Math.round((minutes * 0.25) / 15) * 15;
  const last = Math.round((minutes * 0.25) / 15) * 15;
  const budget = Number(input.budget);
  const firstCap = Math.floor(budget * 0.2);
  const mainCap = Math.floor(budget * 0.5);
  const location = `${input.place} · ${input.setting === "indoor" ? "choose an indoor meeting spot" : "choose an accessible public spot"}`;
  return {
    id: crypto.randomUUID(),
    input,
    variation,
    steps: [
      {
        title:
          input.setting === "indoor"
            ? "Hello, humans! Settle in"
            : "Meet up & find your little spot",
        location,
        notes: `Welcome all ${input.guests} friends, check access needs, and agree on the plan. Allow time to get settled.`,
        minutes: first,
        cap: firstCap,
      },
      {
        title: activityTitle,
        location,
        notes: activityNotes,
        minutes: minutes - first - last,
        cap: mainCap,
      },
      {
        title:
          input.setting === "indoor"
            ? "One last snack & a good catch-up"
            : "Unpack snacks & wind down",
        location,
        notes:
          "Bring snacks or drinks from home, catch up, and leave time to tidy up before heading home.",
        minutes: last,
        cap: budget - firstCap - mainCap,
      },
    ],
  };
}
export function money(amount, currency) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
export function dateLabel(value) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}
export function timeLabel(time, offset = 0) {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour * 60 + minute + offset;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}${total >= 1440 ? " (+1 day)" : ""}`;
}
export function planText(plan) {
  let offset = 0;
  const { input } = plan;
  return [
    input.title,
    `${dateLabel(input.date)} · ${input.time} · ${input.place}`,
    `${input.guests} people · ${input.duration} hours · ${money(Number(input.budget), input.currency)} spending limit per person`,
    "",
    ...plan.steps.map((step) => {
      const text = `${timeLabel(input.time, offset)}–${timeLabel(input.time, offset + step.minutes)} | ${step.title}\n${step.location}\n${step.notes}\nSpending cap: ${money(step.cap, input.currency)} per person`;
      offset += step.minutes;
      return `${text}\n`;
    }),
    input.notes ? `Group notes: ${input.notes}\n` : "",
    "Activity ideas only. Venues, opening hours, prices, access, weather, and availability have not been checked. Spending caps are your allocations, not price estimates.",
  ]
    .filter(Boolean)
    .join("\n");
}
export function isSavedPlan(plan) {
  if (
    !plan ||
    typeof plan.id !== "string" ||
    plan.id.length > 100 ||
    !plan.input ||
    Object.keys(validateForm(plan.input, { allowPast: true })).length
  )
    return false;
  if (
    !Number.isInteger(plan.variation) ||
    plan.variation < 0 ||
    !validDate((plan.savedAt || "").slice(0, 10))
  )
    return false;
  if (!Array.isArray(plan.steps) || plan.steps.length !== 3) return false;
  if (
    !plan.steps.every(
      (step) =>
        step &&
        ["title", "location", "notes"].every(
          (key) =>
            typeof step[key] === "string" &&
            step[key].trim() &&
            step[key].length <= { title: 100, location: 200, notes: 600 }[key],
        ) &&
        Number.isInteger(step.minutes) &&
        step.minutes > 0 &&
        Number.isInteger(step.cap) &&
        step.cap >= 0,
    )
  )
    return false;
  return (
    plan.steps.reduce((sum, step) => sum + step.minutes, 0) ===
      Number(plan.input.duration) * 60 &&
    plan.steps.reduce((sum, step) => sum + step.cap, 0) ===
      Number(plan.input.budget)
  );
}
export function readPlans(storage) {
  try {
    const value = storage.getItem(STORAGE_KEY);
    if (value === null) return { plans: [], error: "" };
    const parsed = JSON.parse(value);
    if (
      !Array.isArray(parsed) ||
      parsed.length > MAX_PLANS ||
      parsed.some((plan) => !isSavedPlan(plan)) ||
      new Set(parsed.map((plan) => plan.id)).size !== parsed.length
    )
      throw new Error("Invalid saved plans");
    return { plans: parsed, error: "" };
  } catch {
    return {
      plans: [],
      error:
        "Saved plans could not be read. You can still make a plan and copy it. Existing stored data will not be overwritten.",
    };
  }
}
export function savePlan(storage, plans, plan) {
  const saved = { ...plan, savedAt: new Date().toISOString() };
  if (!isSavedPlan(saved))
    throw new Error(
      "Check that each activity has a title, place, and notes before saving.",
    );
  if (!plans.some((item) => item.id === plan.id) && plans.length >= MAX_PLANS)
    throw new Error(
      "You have 20 saved plans. Copy this plan or update a saved plan.",
    );
  const next = [saved, ...plans.filter((item) => item.id !== saved.id)];
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    throw new Error(
      "This browser could not save the plan. Your edits are still here; use Copy plan to keep a copy.",
    );
  }
  return next;
}
