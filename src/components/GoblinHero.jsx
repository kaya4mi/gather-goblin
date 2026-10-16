import { useState } from "react";
import Goblin from "./Goblin";
const phrases = [
  "Leave it to me! ✨",
  "Your group chat needs a goblin.",
  "Good friends. Excellent snacks.",
  "Big plans? Tiny helper.",
  "I vote for one more dessert!",
];
export default function GoblinHero() {
  const [phrase, setPhrase] = useState(0);
  const [bounce, setBounce] = useState(0);
  function greet() {
    setPhrase(
      (current) =>
        (current + 1 + Math.floor(Math.random() * (phrases.length - 1))) %
        phrases.length,
    );
    setBounce((current) => current + 1);
  }
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="mascot-scene">
        <span className="doodle star star-one" aria-hidden="true">
          ✧
        </span>
        <span className="doodle star star-two" aria-hidden="true">
          ✦
        </span>
        <span className="doodle curly" aria-hidden="true">
          〰
        </span>
        <div className="speech" role="status" aria-live="polite">
          {phrases[phrase]}
        </div>
        <div className="goblin-float">
          <button
            className="goblin-button"
            onClick={greet}
            aria-label="Say hello to the goblin"
          >
            <div key={bounce} className={bounce ? "goblin-bounce" : ""}>
              <Goblin />
            </div>
          </button>
        </div>
        <div className="ground-shadow" />
        <span className="tap-note">
          psst… give me a little tap <span aria-hidden="true">⤴</span>
        </span>
      </div>
      <div className="hero-copy">
        <p className="eyebrow">
          <span aria-hidden="true">✷</span> YOUR TINY CHAOS COORDINATOR
        </p>
        <h1 id="hero-title">
          Less planning.
          <br />
          <span>
            More <em>fun!</em>
            <svg viewBox="0 0 350 18" aria-hidden="true">
              <path d="M5 12Q165-1 344 9M33 17Q204 4 322 15" />
            </svg>
          </span>
        </h1>
        <p className="hero-description">
          Too many opinions? Not enough decisions?
          <br />
          Let your little goblin bring everyone together.
        </p>
        <a className="hero-cta" href="#plan">
          Let’s make a little plan <span aria-hidden="true">↘</span>
        </a>
        <span className="doodle hero-spark" aria-hidden="true">
          ✳
        </span>
      </div>
    </section>
  );
}
