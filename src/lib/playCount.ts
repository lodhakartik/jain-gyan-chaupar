const COUNTER_URL = "https://api.counterapi.dev/v1/lodhakartik/jain-gyan-chaupar/up";

let bumped = false;

export function bumpPlayCount(): void {
  if (bumped) return;
  bumped = true;
  fetch(COUNTER_URL, { cache: "no-store" }).catch(() => {});
}
