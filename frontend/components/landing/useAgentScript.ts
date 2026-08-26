"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentState } from "@/components/hero3d/agentConfig";

export type ScriptTurn = { ask: string; reply: string };

/** The demo conversation, chosen to show three different product capabilities. */
export const SCRIPT: ScriptTurn[] = [
  {
    ask: "Quels sont vos tarifs pour 5 agents ?",
    reply: "Le plan Scale couvre 5 agents à 89 €/mois, 50 000 messages inclus.",
  },
  {
    ask: "Connecte le chatbot à mon site WordPress.",
    reply: "C'est fait. Voici votre script à coller avant la balise </body>.",
  },
  {
    ask: "Résume les conversations de cette semaine.",
    reply: "412 conversations, 94 % résolues sans agent humain. Sujet dominant : livraison.",
  },
];

/** Milliseconds per typed character, and the pauses between phases. */
const ASK_CPS = 38;
const REPLY_CPS = 22;
const THINK_MS = 1300;
const HOLD_MS = 2600;

/**
 * Runs the demo conversation on a loop and reports which state the agent
 * should be in, so the 3D scene and the chat panel stay in lockstep.
 *
 * Pauses whenever the tab is hidden, so returning to the tab does not land
 * mid-sentence with a backlog of queued timers.
 */
export function useAgentScript(enabled = true) {
  const [turn, setTurn] = useState(0);
  const [state, setState] = useState<AgentState>("idle");
  const [askText, setAskText] = useState("");
  const [replyText, setReplyText] = useState("");

  // Every pending timer, so a re-run or unmount can clear all of them.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!enabled || !visible) return;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.current.push(setTimeout(resolve, ms));
      });

    let cancelled = false;
    const current = SCRIPT[turn % SCRIPT.length];

    const type = async (text: string, cps: number, set: (v: string) => void) => {
      for (let i = 1; i <= text.length; i++) {
        if (cancelled) return;
        set(text.slice(0, i));
        await wait(cps);
      }
    };

    (async () => {
      setAskText("");
      setReplyText("");

      setState("listening");
      await type(current.ask, ASK_CPS, setAskText);
      if (cancelled) return;

      setState("thinking");
      await wait(THINK_MS);
      if (cancelled) return;

      setState("speaking");
      await type(current.reply, REPLY_CPS, setReplyText);
      if (cancelled) return;

      setState("idle");
      await wait(HOLD_MS);
      if (cancelled) return;

      setTurn((t) => t + 1);
    })();

    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [turn, enabled, visible]);

  return { state, askText, replyText, turnIndex: turn % SCRIPT.length };
}
