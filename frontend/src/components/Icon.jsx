export function Icon({ name, size = 18 }) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    send: <path d="m21 3-7.5 18-3.8-7.7L3 10.5 21 3Zm-11.4 10.3L14.5 9" />,
    copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" /></>,
    sound: <><path d="M4 10v4h4l5 4V6L8 10H4Z" /><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" /></>,
    like: <path d="M7 10v10H4V10h3Zm3 10h7.1a2 2 0 0 0 1.9-1.4l1.4-5A2 2 0 0 0 18.5 11H15l.5-3.1A3.2 3.2 0 0 0 12.3 4L10 10v10Z" />,
    dislike: <path d="M7 14V4H4v10h3Zm3-10h7.1A2 2 0 0 1 19 5.4l1.4 5a2 2 0 0 1-1.9 2.6H15l.5 3.1a3.2 3.2 0 0 1-3.2 3.9L10 14V4Z" />,
    retry: <path d="M20 11a8 8 0 1 0 2 5.3M20 4v7h-7" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20.5 15.3A8.8 8.8 0 0 1 8.7 3.5 9 9 0 1 0 20.5 15.3Z" />,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></>,
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
