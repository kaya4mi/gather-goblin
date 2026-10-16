const features = [
  {
    id: "gathering",
    number: "01",
    icon: "🎉",
    title: "Plan a Gathering",
    text: "Less “so… what’s the plan?”\nMore time with your people.",
    action: "Round up the gang",
    color: "pink",
  },
  {
    id: "food",
    number: "02",
    icon: "🍜",
    title: "Feed Me!",
    text: "A big appetite. A tiny decision span.\nWe get it.",
    action: "Find something yummy",
    color: "yellow",
  },
  {
    id: "profile",
    number: "03",
    icon: "🌱",
    title: "My Little Corner",
    text: "Your favorite things, your kind of fun.\nA little space that’s all you.",
    action: "Make yourself at home",
    color: "green",
  },
];
export default function FeatureCards({ onSelect }) {
  return (
    <section
      className="adventures"
      id="pick-your-adventure"
      aria-labelledby="adventure-title"
    >
      <div className="section-heading">
        <h2 id="adventure-title">What are we feeling today?</h2>
        <span>
          pick your little adventure <span aria-hidden="true">↙</span>
        </span>
      </div>
      <div className="feature-grid">
        {features.map((feature) => (
          <button
            key={feature.id}
            className={`feature-card ${feature.color}`}
            onClick={() => onSelect(feature.id)}
          >
            <div className="card-top">
              <span className="feature-icon" aria-hidden="true">
                {feature.icon}
              </span>
              <span className="card-number">{feature.number} /</span>
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
            <div className="card-action">
              {feature.action}
              <span className="card-arrow" aria-hidden="true">
                ↗
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
