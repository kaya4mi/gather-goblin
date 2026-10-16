export default function Navbar({ onAbout, onProfile }) {
  return (
    <header className="navbar">
      <a className="brand" href="#home" aria-label="Gather Goblin home">
        <img src="/goblin.svg" alt="" />
        gather goblin<span>.</span>
      </a>
      <nav aria-label="Main navigation">
        <button className="nav-link" onClick={onAbout}>
          Meet the goblin
        </button>
        <button className="profile-link" onClick={onProfile}>
          My little corner <span aria-hidden="true">↗</span>
        </button>
      </nav>
    </header>
  );
}
