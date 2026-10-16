export default function Goblin() {
  return (
    <svg
      className="goblin-art"
      viewBox="0 0 430 360"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="body"
          x1="150"
          y1="80"
          x2="290"
          y2="310"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#bbd88d" />
          <stop offset="1" stopColor="#91b86b" />
        </linearGradient>
      </defs>
      <g
        stroke="#42583a"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M129 124C94 120 69 95 65 76c28-3 49 8 67 27M294 112c24-28 50-35 69-28-6 26-25 42-52 46"
          fill="#a7c77d"
        />
        <path
          d="m150 90-5-49c24 3 39 22 42 40m65 1 25-41c15 18 12 37 6 52"
          fill="#eee1b2"
        />
        <path
          d="M105 230c-13-55-1-136 58-151 41-12 66-9 101 0 53 16 66 85 61 139 7 41-14 91-49 93-24 16-94 18-117 2-40 5-61-32-54-83Z"
          fill="url(#body)"
        />
        <path
          d="M157 301c-19 6-29 21-23 30 12 13 40 7 50-17m65 0c13 23 38 29 50 15 6-10-8-23-22-27"
          fill="#95ba70"
        />
        <path d="M184 119q8-11 16-4m45 0q8-6 15 4" strokeWidth="3" />
        <g className="goblin-eyes" fill="#fffdf1">
          <ellipse cx="174" cy="157" rx="23" ry="29" />
          <ellipse cx="254" cy="157" rx="23" ry="29" />
          <ellipse
            cx="181"
            cy="161"
            rx="8"
            ry="13"
            fill="#354630"
            stroke="none"
          />
          <ellipse
            cx="247"
            cy="161"
            rx="8"
            ry="13"
            fill="#354630"
            stroke="none"
          />
          <circle cx="184" cy="156" r="3" fill="white" stroke="none" />
          <circle cx="250" cy="156" r="3" fill="white" stroke="none" />
        </g>
        <ellipse
          cx="141"
          cy="187"
          rx="17"
          ry="10"
          fill="#e8afa0"
          stroke="none"
        />
        <ellipse
          cx="283"
          cy="187"
          rx="17"
          ry="10"
          fill="#e8afa0"
          stroke="none"
        />
        <path d="M192 190q22 24 43-1" fill="#54613d" />
        <path d="m200 197 7 8 6-6" fill="#fffdf1" strokeWidth="2" />
        <path
          d="M120 216c-39-20-53 4-31 26l36 17m184-44c43-17 51 8 26 28l-31 16"
          fill="#a3c67a"
        />
        <path d="m129 228 165 1-14 82-136-1Z" fill="#c4b4df" />
        <path d="m129 228 165 1-9 8-147-1Z" fill="#e1d6ef" strokeWidth="2" />
        <path d="M133 311h158l-10 11H143Z" fill="#ac98cc" />
        <path
          d="m214 257 4 8 9 1-7 6 1 9-8-4-8 4 1-9-6-6 9-1Z"
          fill="#faf1b4"
          strokeWidth="2"
        />
        <path d="M94 232q14-9 27 7m214-7q-17-8-27 8" />
      </g>
      <g stroke="#42583a" strokeWidth="2" strokeLinecap="round" opacity=".35">
        <path d="m149 94 4 7m-18 6 6 3m146 3 6-5m-176 83 5 5m183-7-5 7" />
      </g>
    </svg>
  );
}
