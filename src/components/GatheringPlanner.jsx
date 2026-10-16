import { useEffect, useRef, useState } from "react";
import {
  CURRENCIES,
  VIBES,
  dateLabel,
  emptyForm,
  generatePlan,
  localDate,
  money,
  planText,
  readPlans,
  savePlan,
  timeLabel,
  validateForm,
} from "../lib/planner";
import "./GatheringPlanner.css";

function loadSavedPlans() {
  try {
    return readPlans(window.localStorage);
  } catch {
    return {
      plans: [],
      error:
        "Browser storage is unavailable. You can still create and copy a plan.",
    };
  }
}
function FieldError({ name, errors }) {
  return errors[name] ? (
    <span className="field-error" id={`${name}-error`}>
      {errors[name]}
    </span>
  ) : null;
}
export default function GatheringPlanner() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [plan, setPlan] = useState(null);
  const [savedState, setSavedState] = useState(loadSavedPlans);
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null);
  const [pending, setPending] = useState(null);
  const [copyFallback, setCopyFallback] = useState(false);
  const [stepError, setStepError] = useState("");
  const resultHeading = useRef(null);
  const confirmDialog = useRef(null);
  const editor = useRef(null);
  const textCopy = useRef(null);
  const savedPlan =
    plan && savedState.plans.find((item) => item.id === plan.id);
  const dirty = Boolean(
    plan && (!savedPlan || JSON.stringify(plan) !== JSON.stringify(savedPlan)),
  );
  const formChanged =
    plan && JSON.stringify(form) !== JSON.stringify(plan.input);
  const totalBudget = plan
    ? Number(plan.input.budget) * Number(plan.input.guests)
    : 0;

  useEffect(() => {
    function beforeUnload(event) {
      event.preventDefault();
      event.returnValue = "";
    }
    if (dirty || editing !== null)
      window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty, editing]);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }
  function requestAction(action) {
    if (dirty || editing !== null || formChanged) {
      setPending(action);
      confirmDialog.current.showModal();
    } else perform(action);
  }
  function focusResult() {
    requestAnimationFrame(() => resultHeading.current?.focus());
  }
  function perform(action) {
    setEditing(null);
    setCopyFallback(false);
    setStepError("");
    setStatus("");
    if (action.type === "load") {
      setPlan(action.plan);
      setForm(action.plan.input);
      setErrors({});
      focusResult();
    } else if (action.type === "new") {
      setPlan(null);
      setForm(emptyForm());
      setErrors({});
      requestAnimationFrame(() =>
        document.getElementById("gathering-name")?.focus(),
      );
    } else {
      const next = generatePlan(action.form, action.variation);
      setPlan(next);
      setForm(next.input);
      focusResult();
    }
  }
  function submit(event) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() =>
        document
          .getElementById(
            Object.keys(nextErrors)[0] === "title"
              ? "gathering-name"
              : Object.keys(nextErrors)[0],
          )
          ?.focus(),
      );
      return;
    }
    requestAction({
      type: "generate",
      form: { ...form, vibes: [...form.vibes] },
      variation: 0,
    });
  }
  function save() {
    setStatus("");
    if (savedState.error) {
      setStatus(
        "Browser storage needs attention. Please copy this plan to keep it.",
      );
      return;
    }
    try {
      const latest = readPlans(window.localStorage);
      if (latest.error) throw new Error(latest.error);
      const next = savePlan(window.localStorage, latest.plans, plan);
      setSavedState({ plans: next, error: "" });
      setPlan(next[0]);
      setStatus(
        formChanged
          ? "Plan saved. Changes in the form are not included; generate a new plan to use them."
          : "Saved in this browser. Your goblin will keep it here.",
      );
    } catch (error) {
      setStatus(error.message);
    }
  }
  async function copy() {
    const text = planText(plan);
    try {
      await navigator.clipboard.writeText(text);
      setCopyFallback(false);
      setStatus("Plan copied! Paste it into your group chat.");
    } catch {
      setCopyFallback(true);
      setStatus("Select and copy the plan below.");
      requestAnimationFrame(() => {
        textCopy.current?.focus();
        textCopy.current?.select();
      });
    }
  }
  function applyEdit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (Object.values(values).some((value) => !value.trim())) {
      setStepError("Please fill in a title, meeting place, and notes.");
      return;
    }
    setPlan((current) => ({
      ...current,
      steps: current.steps.map((step, index) =>
        index === editing
          ? {
              ...step,
              ...Object.fromEntries(
                Object.entries(values).map(([key, value]) => [
                  key,
                  value.trim(),
                ]),
              ),
            }
          : step,
      ),
    }));
    setEditing(null);
    setStepError("");
    setStatus("Activity updated. Save your plan to keep this change.");
    focusResult();
  }
  const described = (name) => (errors[name] ? `${name}-error` : undefined);

  return (
    <div className="planner">
      <div className="planner-topline">
        <a href="#home" className="back-home">
          ← Back to the goblin
        </a>
        <span>GOOD COMPANY STARTS HERE</span>
      </div>
      <header className="planner-intro">
        <div>
          <p className="eyebrow">✦ LET’S GET YOUR PEOPLE TOGETHER</p>
          <h1 id="planner-title" tabIndex={-1}>
            A little plan.
            <br />
            <span>A lovely time.</span>
          </h1>
          <p>Bring the friends. Your goblin will bring the ideas.</p>
        </div>
        <div className="planner-sticker" aria-hidden="true">
          <img src="/goblin.svg" alt="" />
          <span>consider it planned ♡</span>
        </div>
      </header>
      <div className="planner-layout">
        <section
          className="planning-form-panel"
          aria-labelledby="details-heading"
        >
          <div className="panel-heading">
            <span className="step-badge">01</span>
            <div>
              <h2 id="details-heading">The little details</h2>
              <p>Tell us what your kind of fun looks like.</p>
            </div>
          </div>
          <form onSubmit={submit} noValidate className="planning-form">
            <label htmlFor="gathering-name">
              Give it a name
              <input
                id="gathering-name"
                name="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Saturday with my favorite humans"
                maxLength={80}
                required
                aria-invalid={Boolean(errors.title)}
                aria-describedby={described("title")}
              />
              <FieldError name="title" errors={errors} />
            </label>
            <label htmlFor="place">
              Where are we gathering?
              <input
                id="place"
                name="place"
                value={form.place}
                onChange={(e) => update("place", e.target.value)}
                placeholder="City, neighborhood, or a friend’s home"
                maxLength={160}
                required
                aria-invalid={Boolean(errors.place)}
                aria-describedby={described("place")}
              />
              <FieldError name="place" errors={errors} />
            </label>
            <div className="form-pair">
              <label htmlFor="date">
                Date
                <input
                  id="date"
                  type="date"
                  value={form.date}
                  min={localDate()}
                  max="9999-12-31"
                  onChange={(e) => update("date", e.target.value)}
                  onInput={(e) => update("date", e.currentTarget.value)}
                  required
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={described("date")}
                />
                <FieldError name="date" errors={errors} />
              </label>
              <label htmlFor="time">
                Start time
                <input
                  id="time"
                  type="time"
                  value={form.time}
                  onChange={(e) => update("time", e.target.value)}
                  onInput={(e) => update("time", e.currentTarget.value)}
                  required
                  aria-invalid={Boolean(errors.time)}
                  aria-describedby={described("time")}
                />
                <FieldError name="time" errors={errors} />
              </label>
            </div>
            <div className="form-pair">
              <label htmlFor="guests">
                People, including you
                <input
                  id="guests"
                  type="number"
                  min="2"
                  max="30"
                  step="1"
                  value={form.guests}
                  onChange={(e) => update("guests", e.target.value)}
                  required
                  aria-invalid={Boolean(errors.guests)}
                  aria-describedby={described("guests")}
                />
                <FieldError name="guests" errors={errors} />
              </label>
              <label htmlFor="duration">
                Time together
                <select
                  id="duration"
                  value={form.duration}
                  onChange={(e) => update("duration", e.target.value)}
                >
                  {[2, 3, 4, 6].map((hours) => (
                    <option key={hours} value={hours}>
                      {hours} hours
                    </option>
                  ))}
                </select>
                <FieldError name="duration" errors={errors} />
              </label>
            </div>
            <div className="form-pair budget-fields">
              <label htmlFor="budget">
                Budget per person
                <input
                  id="budget"
                  type="number"
                  min="0"
                  max="1000000"
                  step="1"
                  value={form.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  required
                  aria-invalid={Boolean(errors.budget)}
                  aria-describedby={
                    errors.budget ? "budget-hint budget-error" : "budget-hint"
                  }
                />
                <FieldError name="budget" errors={errors} />
              </label>
              <label htmlFor="currency">
                Currency
                <select
                  id="currency"
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value)}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency}>{currency}</option>
                  ))}
                </select>
                <FieldError name="currency" errors={errors} />
              </label>
            </div>
            <p className="field-hint" id="budget-hint">
              Your spending limit, not an estimated price. A zero-budget hangout
              is welcome!
            </p>
            <fieldset
              id="vibes"
              tabIndex={-1}
              aria-describedby={described("vibes")}
            >
              <legend>
                What’s the vibe? <span>Pick one or more</span>
              </legend>
              <div className="vibe-options">
                {VIBES.map((vibe) => (
                  <label
                    key={vibe.id}
                    className={`vibe-option ${form.vibes.includes(vibe.id) ? "is-selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.vibes.includes(vibe.id)}
                      onChange={(e) =>
                        update(
                          "vibes",
                          e.target.checked
                            ? [...form.vibes, vibe.id]
                            : form.vibes.filter((id) => id !== vibe.id),
                        )
                      }
                    />
                    <span aria-hidden="true">{vibe.icon}</span>
                    {vibe.label}
                  </label>
                ))}
              </div>
              <FieldError name="vibes" errors={errors} />
            </fieldset>
            <fieldset>
              <legend>Where’s your happy place?</legend>
              <div className="setting-options">
                {[
                  ["indoor", "☕ Indoors"],
                  ["outdoor", "🌿 Outdoors"],
                ].map(([value, label]) => (
                  <label
                    className={form.setting === value ? "is-selected" : ""}
                    key={value}
                  >
                    <input
                      type="radio"
                      name="setting"
                      value={value}
                      checked={form.setting === value}
                      onChange={() => update("setting", value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label htmlFor="notes">
              Anything to keep in mind?{" "}
              <span className="optional">Optional</span>
              <textarea
                id="notes"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Dietary needs, access needs, things to bring…"
                maxLength={500}
                rows={3}
              />
              <span className="field-hint">
                Added to your plan so your group can check it together.
              </span>
              <FieldError name="notes" errors={errors} />
            </label>
            {Object.values(errors).some(Boolean) && (
              <p role="alert" className="form-error">
                Check the marked details, then try again.
              </p>
            )}
            {formChanged && (
              <p className="form-change-note">
                You changed the details. Generate a new plan to use them; your
                current plan stays below until then.
              </p>
            )}
            <button className="planner-primary generate-button" type="submit">
              {plan ? "Make a new plan" : "Make my little plan"}{" "}
              <span aria-hidden="true">✦</span>
            </button>
            <p className="planner-smallprint">
              Built-in activity ideas, ready for your own touches.
              <br />
              No venue search or bookings.
            </p>
          </form>
        </section>
        <div className="planner-right">
          <section
            className={`plan-panel ${plan ? "has-plan" : ""}`}
            aria-labelledby="plan-heading"
          >
            <div className="panel-heading">
              <span className="step-badge lavender-badge">02</span>
              <div>
                <h2 ref={resultHeading} tabIndex={-1} id="plan-heading">
                  {plan ? "Your little gathering" : "A little magic goes here"}
                </h2>
                <p>
                  {plan
                    ? "A starting point. Make it yours."
                    : "Fill in the details and let’s make a plan."}
                </p>
              </div>
            </div>
            {!plan ? (
              <div className="plan-empty">
                <div aria-hidden="true">
                  ✧<img src="/goblin.svg" alt="" />✧
                </div>
                <h3>Good times, loading…</h3>
                <p>
                  Your goblin is ready to turn
                  <br />
                  “we should hang out” into a plan.
                </p>
                <span>three little stops. lots of good company.</span>
              </div>
            ) : (
              <>
                <div className="plan-summary">
                  <span className="plan-kicker">YOUR NEXT GOOD MEMORY</span>
                  <h3>{plan.input.title}</h3>
                  <p>
                    {dateLabel(plan.input.date)} · {plan.input.time}
                  </p>
                  <p className="summary-place">{plan.input.place}</p>
                  <div className="plan-tags">
                    <span>{plan.input.guests} friends</span>
                    <span>{plan.input.duration} hours</span>
                    <span>
                      {plan.input.setting === "indoor" ? "Indoors" : "Outdoors"}
                    </span>
                  </div>
                </div>
                <div className="budget-summary">
                  <span>
                    Your spending limit
                    <strong>
                      {money(Number(plan.input.budget), plan.input.currency)}{" "}
                      <small>/ person</small>
                    </strong>
                  </span>
                  <span>
                    Whole group
                    <strong>{money(totalBudget, plan.input.currency)}</strong>
                  </span>
                </div>
                <div className="plan-timeline">
                  {plan.steps.map((step, index) => {
                    const offset = plan.steps
                      .slice(0, index)
                      .reduce((sum, item) => sum + item.minutes, 0);
                    return (
                      <article
                        className="timeline-step"
                        key={`${plan.id}-${index}`}
                      >
                        <div className="timeline-marker" aria-hidden="true">
                          {index + 1}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-time">
                            <span>
                              {timeLabel(plan.input.time, offset)}–
                              {timeLabel(
                                plan.input.time,
                                offset + step.minutes,
                              )}
                            </span>
                            <button
                              type="button"
                              className="edit-step"
                              disabled={editing !== null && editing !== index}
                              onClick={() => {
                                setEditing(index);
                                setStepError("");
                                requestAnimationFrame(() =>
                                  editor.current?.focus(),
                                );
                              }}
                              aria-label={`Edit activity ${index + 1}`}
                            >
                              Edit ↗
                            </button>
                          </div>
                          {editing === index ? (
                            <form
                              className="activity-editor"
                              onSubmit={applyEdit}
                            >
                              <label>
                                Activity name
                                <input
                                  ref={editor}
                                  name="title"
                                  defaultValue={step.title}
                                  maxLength={100}
                                  required
                                />
                              </label>
                              <label>
                                Meeting place
                                <input
                                  name="location"
                                  defaultValue={step.location}
                                  maxLength={200}
                                  required
                                />
                              </label>
                              <label>
                                Activity notes
                                <textarea
                                  name="notes"
                                  defaultValue={step.notes}
                                  maxLength={600}
                                  required
                                  rows={4}
                                />
                              </label>
                              {stepError && (
                                <p role="alert" className="field-error">
                                  {stepError}
                                </p>
                              )}
                              <div className="editor-buttons">
                                <button
                                  className="planner-primary"
                                  type="submit"
                                >
                                  Apply changes
                                </button>
                                <button
                                  type="button"
                                  className="planner-secondary"
                                  onClick={() => {
                                    setEditing(null);
                                    setStepError("");
                                    focusResult();
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <h4>{step.title}</h4>
                              <p className="step-location">⌖ {step.location}</p>
                              <p className="step-description">{step.notes}</p>
                            </>
                          )}
                          <p className="step-cap">
                            Spending cap ·{" "}
                            {money(step.cap, plan.input.currency)} / person
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
                {plan.input.notes && (
                  <div className="group-notes">
                    <h4>A little note for the group</h4>
                    <p>{plan.input.notes}</p>
                    <span>
                      Check these needs together before confirming any activity.
                    </span>
                  </div>
                )}
                <div className="reality-note">
                  <span aria-hidden="true">✧</span>
                  <p>
                    These are activity ideas, not confirmed venues. Check
                    opening hours, access, availability, and actual costs
                    together.
                    {plan.input.setting === "outdoor"
                      ? " Check the weather and agree on an indoor backup."
                      : ""}{" "}
                    Spending caps are budget allocations, not price estimates.
                  </p>
                </div>
                <div className="plan-actions">
                  <button
                    type="button"
                    className="planner-primary"
                    onClick={save}
                    disabled={editing !== null}
                  >
                    {savedPlan ? "Save changes" : "Save this plan"}{" "}
                    <span aria-hidden="true">♡</span>
                  </button>
                  <button
                    type="button"
                    className="planner-secondary"
                    onClick={copy}
                    disabled={editing !== null}
                  >
                    Copy plan ↗
                  </button>
                </div>
                <div className="plan-bottomline">
                  <span>
                    {dirty ? "Not saved yet" : "Saved in this browser"}
                    {editing !== null
                      ? " · Apply or cancel your activity edits first."
                      : ""}
                  </span>
                  <button
                    className="text-button"
                    type="button"
                    disabled={editing !== null}
                    onClick={() =>
                      requestAction({
                        type: "generate",
                        form: plan.input,
                        variation: plan.variation + 1,
                      })
                    }
                  >
                    Try another idea ↻
                  </button>
                </div>
                {formChanged && (
                  <p className="field-hint result-form-note">
                    This plan uses the details shown above. Form changes are not
                    included until you generate again.
                  </p>
                )}
                {copyFallback && (
                  <label className="copy-fallback">
                    Your plan, ready to copy
                    <textarea
                      ref={textCopy}
                      readOnly
                      rows={12}
                      value={planText(plan)}
                    />
                  </label>
                )}
              </>
            )}
            <p className="save-status" role="status" aria-live="polite">
              {status}
            </p>
          </section>
          <section className="saved-plans" aria-labelledby="saved-heading">
            <div className="saved-heading">
              <div>
                <p className="eyebrow">KEEP THE GOOD IDEAS</p>
                <h2 id="saved-heading">
                  Your plan jar <span>({savedState.plans.length})</span>
                </h2>
              </div>
              <button
                type="button"
                className="text-button"
                onClick={() => requestAction({ type: "new" })}
              >
                + New plan
              </button>
            </div>
            <p className="saved-caption">
              Saved only in this browser on this device. Copy a plan to share it
              or keep it elsewhere.
            </p>
            {savedState.error ? (
              <p className="storage-error" role="alert">
                {savedState.error}
              </p>
            ) : savedState.plans.length === 0 ? (
              <p className="saved-empty">
                No plans tucked away yet. Save your first little adventure
                above.
              </p>
            ) : (
              <ul className="saved-list">
                {savedState.plans.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="saved-plan-button"
                      onClick={() =>
                        requestAction({ type: "load", plan: item })
                      }
                    >
                      <span>
                        <strong>{item.input.title}</strong>
                        <small>
                          {dateLabel(item.input.date)} · {item.input.guests}{" "}
                          friends
                        </small>
                      </span>
                      <span aria-hidden="true">↗</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
      <dialog
        ref={confirmDialog}
        className="discard-dialog"
        aria-labelledby="discard-heading"
        onClose={() => setPending(null)}
      >
        <div>
          <span aria-hidden="true" className="discard-heart">
            ♡
          </span>
          <h2 id="discard-heading">Keep this little idea?</h2>
          <p>
            {editing !== null
              ? "You have unfinished activity edits and an unsaved plan. Continuing will discard them."
              : "Your current plan or form has changes. Continuing will replace them."}
          </p>
          <p>Choose “Keep editing” to save or copy your plan first.</p>
          <div className="confirm-actions">
            <button
              type="button"
              className="planner-primary"
              onClick={() => confirmDialog.current.close()}
            >
              Keep editing
            </button>
            <button
              type="button"
              className="planner-secondary"
              onClick={() => {
                const action = pending;
                confirmDialog.current.close();
                if (action) perform(action);
              }}
            >
              Discard & continue
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
