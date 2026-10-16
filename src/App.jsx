import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import GatheringPlanner from "./components/GatheringPlanner";
import Navbar from "./components/Navbar";
import GoblinHero from "./components/GoblinHero";
import FeatureCards from "./components/FeatureCards";
import "./App.css";
const details = {
  about: {
    title: "Small goblin. Big friend energy.",
    text: "Meet your tiny chaos coordinator: a little helper for the endless “where should we go?” group chat. Good food, good company, and a little less planning.",
    note: "Made for indecisive friends, with love.",
  },
  food: {
    title: "Something yummy is coming.",
    text: "Your goblin is collecting delicious ideas for those “anything is fine” days.",
    note: "Food picks are coming soon. Save a little room for dessert.",
  },
  profile: {
    title: "A little corner, just for you.",
    text: "Your favorite food, your kind of hangout, and all the things that make a plan feel like you.",
    note: "Profiles are coming soon. Your goblin is making it cozy.",
  },
};
function subscribeToHash(callback) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
function App() {
  const isPlanning = useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash === "#plan",
    () => false,
  );
  useEffect(() => {
    if (isPlanning) document.getElementById("planner-title")?.focus();
  }, [isPlanning]);
  const [selected, setSelected] = useState("about");
  const dialog = useRef(null);
  function openDetails(id) {
    if (id === "gathering") {
      window.location.hash = "plan";
      return;
    }
    setSelected(id);
    dialog.current.showModal();
  }
  return (
    <div className="app" id="home">
      <Navbar
        onAbout={() => openDetails("about")}
        onProfile={() => openDetails("profile")}
      />
      <main hidden={isPlanning}>
        <GoblinHero />
        <FeatureCards onSelect={openDetails} />
        <p className="little-note">
          <span aria-hidden="true">♡</span> Good plans start with good company.
          We’ll handle the little things.
        </p>
      </main>
      <main hidden={!isPlanning}>
        <GatheringPlanner />
      </main>
      <footer>
        <a className="footer-brand" href="#home">
          gather goblin.
        </a>
        <span>
          Made for indecisive friends <span aria-hidden="true">♡</span>
        </span>
        <span className="footer-note">
          a little less chaos, a little more joy.
        </span>
      </footer>
      <dialog
        ref={dialog}
        className="detail-dialog"
        aria-labelledby="detail-title"
        aria-describedby="detail-description"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="dialog-inner">
          <form method="dialog">
            <button className="close-button" aria-label="Close dialog">
              ×
            </button>
          </form>
          <img src="/goblin.svg" alt="" />
          <p className="eyebrow">A NOTE FROM YOUR GOBLIN</p>
          <h2 id="detail-title">{details[selected].title}</h2>
          <p id="detail-description">{details[selected].text}</p>
          <p className="dialog-note">{details[selected].note}</p>
          <form method="dialog">
            <button className="dialog-done">
              Got it, little buddy <span aria-hidden="true">♡</span>
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
export default App;
