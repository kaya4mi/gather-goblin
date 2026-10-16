import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyForm,
  generatePlan,
  validateForm,
  localDate,
  validDate,
  timeLabel,
  planText,
  readPlans,
  savePlan,
  isSavedPlan,
  STORAGE_KEY,
  MAX_PLANS,
  CURRENCIES,
  VIBES,
} from "../src/lib/planner.js";
const form = (changes = {}) => ({
  ...emptyForm(),
  title: "Friends together",
  place: "Our living room",
  ...changes,
});
function storage(initial = null) {
  let data = initial;
  return {
    getItem: () => data,
    setItem: (key, value) => {
      assert.equal(key, STORAGE_KEY);
      data = value;
    },
  };
}

test("invalid dates, past dates, empty names, quantities, and empty vibes are rejected", () => {
  assert.deepEqual(validateForm(form()), {});
  assert.ok(
    validateForm(
      form({
        title: "  ",
        place: "",
        date: "2026-02-30",
        time: "25:00",
        guests: "1",
        budget: "-1",
        vibes: [],
      }),
    ).title,
  );
  for (const [field, values] of Object.entries({
    guests: ["", "1", "31", "3.5"],
    budget: ["", "-1", "2.5", "Infinity", "1000001", null],
    time: ["24:00", "12:70", ""],
    duration: ["0", "5"],
    currency: ["GBP"],
    setting: ["moon"],
    vibes: [[]],
  })) {
    for (const value of values)
      assert.ok(
        validateForm(form({ [field]: value }))[field],
        `${field} ${value}`,
      );
  }
  assert.ok(validateForm(form({ date: "2000-01-01" })).date);
  assert.deepEqual(
    validateForm(form({ date: "2000-01-01" }), { allowPast: true }),
    {},
  );
  assert.equal(validDate("2028-02-29"), true);
  assert.equal(validDate("2027-02-29"), false);
});

test("all supported durations, settings, vibes, and budgets produce exact time and money allocations", () => {
  for (const duration of ["2", "3", "4", "6"])
    for (const budget of ["0", "1", "19", "3000", "1000000"])
      for (const setting of ["indoor", "outdoor"])
        for (const vibe of VIBES) {
          const plan = generatePlan(
            form({ duration, budget, setting, vibes: [vibe.id] }),
          );
          assert.equal(plan.steps.length, 3);
          assert.equal(
            plan.steps.reduce((sum, step) => sum + step.minutes, 0),
            Number(duration) * 60,
          );
          assert.equal(
            plan.steps.reduce((sum, step) => sum + step.cap, 0),
            Number(budget),
          );
          assert.ok(
            plan.steps.every(
              (step) =>
                step.minutes > 0 && Number.isInteger(step.cap) && step.cap >= 0,
            ),
          );
          if (setting === "indoor")
            assert.ok(plan.steps.every((step) => /indoor/.test(step.location)));
        }
});

test("reroll changes ideas and rotates through selected vibes", () => {
  const input = form({ vibes: ["chill", "creative"] });
  const titles = [0, 1, 2, 3].map(
    (variation) => generatePlan(input, variation).steps[1].title,
  );
  assert.equal(new Set(titles).size, 4);
  assert.notEqual(
    generatePlan(form(), 0).steps[1].title,
    generatePlan(form(), 1).steps[1].title,
  );
  assert.throws(() => generatePlan(form({ guests: "0" })), /check/);
});

test("input is trimmed and copied, and generated plans get separate identities", () => {
  const input = form({ title: "  Hello friends  ", notes: "  Bring games  " });
  const first = generatePlan(input),
    second = generatePlan(input);
  assert.notEqual(first.id, second.id);
  assert.equal(first.input.title, "Hello friends");
  assert.equal(first.input.notes, "Bring games");
  input.vibes.push("food");
  assert.deepEqual(first.input.vibes, ["chill"]);
});

test("midnight rollover is explicit in displayed and copied timelines", () => {
  assert.equal(timeLabel("23:30", 90), "01:00 (+1 day)");
  assert.equal(timeLabel("14:00", 45), "14:45");
  const plan = generatePlan(form({ time: "23:30", duration: "2" }));
  const text = planText(plan);
  assert.match(text, /01:30 \(\+1 day\)/);
  assert.match(text, /not price estimates/);
  for (const currency of CURRENCIES)
    assert.ok(planText(generatePlan(form({ currency }))));
});

test("save, reload, edit, and update preserve one record per plan", () => {
  const store = storage();
  assert.deepEqual(readPlans(store), { plans: [], error: "" });
  const plan = generatePlan(form());
  let plans = savePlan(store, [], plan);
  assert.equal(plans.length, 1);
  assert.equal(readPlans(store).plans[0].id, plan.id);
  const edited = {
    ...plans[0],
    steps: plans[0].steps.map((step, i) =>
      i === 1 ? { ...step, title: "My very own activity" } : step,
    ),
  };
  plans = savePlan(store, plans, edited);
  assert.equal(plans.length, 1);
  assert.equal(
    readPlans(store).plans[0].steps[1].title,
    "My very own activity",
  );
  const second = generatePlan(form({ title: "Another gathering" }));
  plans = savePlan(store, plans, second);
  assert.equal(plans.length, 2);
  assert.equal(plans[0].id, second.id);
  assert.equal(plans[1].steps[1].title, "My very own activity");
});

test("past saved plans remain readable without permitting new past-date generation", () => {
  const store = storage();
  const plan = generatePlan(form());
  const saved = {
    ...plan,
    input: { ...plan.input, date: "2000-01-01" },
    savedAt: new Date().toISOString(),
  };
  store.setItem(STORAGE_KEY, JSON.stringify([saved]));
  assert.equal(readPlans(store).plans.length, 1);
  assert.throws(() => generatePlan(saved.input));
});

test("corrupt storage is reported and left untouched", () => {
  const store = storage("not json");
  assert.ok(readPlans(store).error);
  assert.equal(store.getItem(STORAGE_KEY), "not json");
  for (const invalid of [{}, [null], [{ id: "bad", input: { title: 42 } }]]) {
    const store = storage(JSON.stringify(invalid));
    assert.ok(readPlans(store).error);
  }
});

test("invalid saved timeline or budget does not reach the UI", () => {
  const plan = { ...generatePlan(form()), savedAt: new Date().toISOString() };
  assert.equal(isSavedPlan(plan), true);
  for (const changes of [
    { minutes: 0 },
    { minutes: 999 },
    { cap: -1 },
    { cap: 99999 },
    { title: "" },
    { notes: " ".repeat(3) },
  ]) {
    const corrupt = {
      ...plan,
      steps: plan.steps.map((step, i) =>
        i === 0 ? { ...step, ...changes } : step,
      ),
    };
    assert.equal(isSavedPlan(corrupt), false);
    assert.ok(readPlans(storage(JSON.stringify([corrupt]))).error);
  }
  assert.ok(readPlans(storage(JSON.stringify([plan, plan]))).error);
});

test("storage read/write failures never report a successful save", () => {
  const broken = {
    getItem() {
      throw new Error("Blocked");
    },
    setItem() {
      throw new Error("Quota");
    },
  };
  assert.ok(readPlans(broken).error);
  assert.throws(
    () => savePlan(broken, [], generatePlan(form())),
    /could not save/,
  );
});

test("plan jar refuses overflow but permits updating an existing plan at capacity", () => {
  const plans = Array.from({ length: MAX_PLANS }, () => ({
    ...generatePlan(form()),
    savedAt: new Date().toISOString(),
  }));
  assert.throws(
    () => savePlan(storage(), plans, generatePlan(form())),
    /20 saved plans/,
  );
  assert.equal(savePlan(storage(), plans, plans[0]).length, MAX_PLANS);
});

test("local date formatting avoids a UTC date conversion", () => {
  const date = new Date(2026, 9, 16, 0, 15);
  assert.equal(localDate(date), "2026-10-16");
});
