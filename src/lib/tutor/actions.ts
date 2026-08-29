export type TutorAction =
  | { type: "highlight"; state: string; color: "blue" | "rose" | "cyan" | "amber" }
  | { type: "test"; value: string }
  | { type: "animate"; value: string }
  | { type: "hintLevel"; level: number }
  | { type: "celebrate" }
  | { type: "gotoTab"; tab: string }
  | { type: "showExample"; str: string; accept: boolean };

const TAG = /<IALE_([A-Z_]+)([^>]*)\/>/g;

function attrs(src: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of src.matchAll(/(\w+)\s*=\s*"([^"]*)"/g)) out[m[1] ?? ""] = m[2] ?? "";
  return out;
}

export function parseTutorActions(text: string): { cleanText: string; actions: TutorAction[] } {
  const actions: TutorAction[] = [];
  const cleanText = text
    .replace(TAG, (_full, tag: string, rest: string) => {
      const a = attrs(rest);
      const state = a["state"];
      const color = a["color"];
      const value = a["value"];
      const level = a["level"];
      const tab = a["tab"];
      const str = a["str"];
      const accept = a["accept"];
      switch (tag) {
        case "HIGHLIGHT_STATE":
          if (state)
            actions.push({
              type: "highlight",
              state,
              color: (color && ["blue", "rose", "cyan", "amber"].includes(color) ? color : "blue") as "blue",
            });
          break;
        case "TEST_STRING":
          if (value !== undefined) actions.push({ type: "test", value });
          break;
        case "ANIMATE_TRACE":
          if (value !== undefined) actions.push({ type: "animate", value });
          break;
        case "SET_HINT_LEVEL":
          actions.push({ type: "hintLevel", level: Math.min(3, Math.max(1, Number(level) || 1)) });
          break;
        case "CELEBRATE":
          actions.push({ type: "celebrate" });
          break;
        case "GOTO_TAB":
          if (tab) actions.push({ type: "gotoTab", tab });
          break;
        case "SHOW_EXAMPLE":
          if (str !== undefined) actions.push({ type: "showExample", str, accept: accept !== "false" });
          break;
      }
      return "";
    })
    .trim();
  return { cleanText, actions: actions.slice(0, 2) };
}

export function dispatchTutorActions(actions: TutorAction[]) {
  if (typeof window === "undefined") return;
  for (const action of actions) window.dispatchEvent(new CustomEvent("iale-tutor-action", { detail: action }));
}

export function useTutorActionsEffect() {
  return null;
}
