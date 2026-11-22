import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Base({ children, ...p }: P) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      {children}
    </svg>
  );
}

export const IconHome = (p: P) => (
  <Base {...p}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></Base>
);
export const IconSliders = (p: P) => (
  <Base {...p}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></Base>
);
export const IconCalendar = (p: P) => (
  <Base {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></Base>
);
export const IconChart = (p: P) => (
  <Base {...p}><path d="M4 20V4M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></Base>
);
export const IconList = (p: P) => (
  <Base {...p}><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></Base>
);
export const IconBlueprint = (p: P) => (
  <Base {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M9 9v11M13 13h4M13 16h3" /></Base>
);
export const IconExternal = (p: P) => (
  <Base {...p}><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></Base>
);
export const IconSettings = (p: P) => (
  <Base {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></Base>
);
export const IconDrop = (p: P) => (
  <Base {...p}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /></Base>
);
export const IconGauge = (p: P) => (
  <Base {...p}><path d="M4 17a8 8 0 1 1 16 0" /><path d="M12 17l4-5" /><circle cx="12" cy="17" r="1.2" /></Base>
);
export const IconFlask = (p: P) => (
  <Base {...p}><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3" /><path d="M7.5 15h9" /></Base>
);
export const IconTank = (p: P) => (
  <Base {...p}><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M5 12h14" /></Base>
);
export const IconFlow = (p: P) => (
  <Base {...p}><path d="M3 8c3 0 3-2 6-2s3 2 6 2 3-2 6-2M3 14c3 0 3-2 6-2s3 2 6 2 3-2 6-2M3 20c3 0 3-2 6-2s3 2 6 2 3-2 6-2" /></Base>
);
export const IconSignal = ({ bars = 4, ...p }: P & { bars?: number }) => (
  <svg viewBox="0 0 20 16" width="18" height="14" aria-hidden="true" {...p}>
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={i * 5} y={12 - i * 4} width="3.4" height={4 + i * 4} rx="1" fill="currentColor" opacity={i < bars ? 1 : 0.25} />
    ))}
  </svg>
);
export const IconAlert = (p: P) => (
  <Base {...p}><path d="M12 3l9.5 17h-19z" /><path d="M12 10v4M12 17.5v.01" /></Base>
);
export const IconCheck = (p: P) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></Base>
);
export const IconInfo = (p: P) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></Base>
);
export const IconStop = (p: P) => (
  <Base {...p}><rect x="6" y="6" width="12" height="12" rx="2" /></Base>
);
export const IconPlay = (p: P) => (
  <Base {...p}><path d="M8 5l11 7-11 7z" /></Base>
);
export const IconClock = (p: P) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Base>
);
export const IconPlus = (p: P) => (
  <Base {...p}><path d="M12 5v14M5 12h14" /></Base>
);
export const IconChevron = (p: P) => (
  <Base {...p}><path d="M9 6l6 6-6 6" /></Base>
);
export const IconBack = (p: P) => (
  <Base {...p}><path d="M15 6l-6 6 6 6" /></Base>
);
export const IconLeaf = (p: P) => (
  <Base {...p}><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" /><path d="M5 19l7-7" /></Base>
);
export const IconLine = (p: P) => (
  <Base {...p}><path d="M4 5h16v11H9l-5 4z" /></Base>
);
export const IconUpload = (p: P) => (
  <Base {...p}><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></Base>
);
