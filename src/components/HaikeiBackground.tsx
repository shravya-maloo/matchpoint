export default function HaikeiBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute -top-24 -left-32 w-[70vw] max-w-[900px] opacity-40 blob-drift-slow"
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="blob1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ccff33" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#4da3ff" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <path
          fill="url(#blob1)"
          d="M421,315Q400,380,349,412Q298,444,238,431Q178,418,135,373Q92,328,98,265Q104,202,150,160Q196,118,258,110Q320,102,368,140Q416,178,432,231Q448,284,421,315Z"
        />
      </svg>

      <svg
        className="absolute top-10 -right-40 w-[60vw] max-w-[800px] opacity-35 blob-drift-slow-reverse"
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="blob2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6fae" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ccff33" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <path
          fill="url(#blob2)"
          d="M447,331Q431,412,362,451Q293,490,222,460Q151,430,116,363Q81,296,113,228Q145,160,213,131Q281,102,347,131Q413,160,437,226Q461,292,447,331Z"
        />
      </svg>

      <svg
        className="absolute bottom-0 left-0 w-full opacity-[0.35]"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4da3ff" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#ccff33" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ff6fae" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <path
          fill="url(#wave1)"
          d="M0,120 C240,180 480,60 720,100 C960,140 1200,60 1440,110 L1440,200 L0,200 Z"
        />
      </svg>
    </div>
  );
}
