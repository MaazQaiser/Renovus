"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/*
 * Minimal typings for the Web Speech API. TypeScript's lib.dom does not ship
 * them yet (checked against 5.9), and only the prefixed constructor exists in
 * Safari, so both are read off `window` behind a feature test.
 */

interface SpeechAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechResult {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: SpeechAlternative;
}

interface SpeechResultList {
  readonly length: number;
  readonly [index: number]: SpeechResult;
}

interface SpeechResultEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechResultList;
}

interface SpeechErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognizerCtor = new () => SpeechRecognizer;

/** Support never changes within a page, so the store never notifies. */
function subscribeNever(): () => void {
  return () => {};
}

function getRecognizerCtor(): SpeechRecognizerCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognizerCtor;
    webkitSpeechRecognition?: SpeechRecognizerCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** `stopping` covers the gap between `stop()` and the engine's last result. */
export type SpeechStatus = "idle" | "listening" | "stopping";

const errorMessages: Record<string, string> = {
  "not-allowed": "Microphone access is blocked. Allow it in your browser, then try again.",
  "service-not-allowed":
    "Microphone access is blocked. Allow it in your browser, then try again.",
  "audio-capture": "No microphone was found.",
  network: "Speech recognition could not reach the network.",
  "no-speech": "We didn't catch that. Try again.",
  "language-not-supported": "Speech recognition does not support this language.",
};

export interface UseSpeechToTextOptions {
  /**
   * Fired on every result with everything heard since `start()` — finalised
   * words plus the phrase the engine is still revising, so the caller can show
   * the transcript building up live.
   */
  onTranscript: (text: string) => void;
  onError?: (message: string) => void;
  /** BCP 47 tag; defaults to the browser's language. */
  lang?: string;
}

export interface SpeechToText {
  /** False in browsers without the Web Speech API, e.g. Firefox. */
  supported: boolean;
  status: SpeechStatus;
  error: string | null;
  start: () => void;
  stop: () => void;
}

export function useSpeechToText({
  onTranscript,
  onError,
  lang,
}: UseSpeechToTextOptions): SpeechToText {
  /*
   * Read through a store rather than state so the server snapshot is `false`
   * and the client's real answer arrives at hydration — no effect, no
   * cascading render.
   */
  const supported = useSyncExternalStore(
    subscribeNever,
    () => getRecognizerCtor() !== null,
    () => false,
  );
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  // Held in refs so a re-render mid-dictation never detaches a live handler.
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onErrorRef.current = onError;
  }, [onTranscript, onError]);

  useEffect(
    () => () => {
      recognizerRef.current?.abort();
      recognizerRef.current = null;
    },
    [],
  );

  const start = useCallback(() => {
    if (recognizerRef.current) return;

    const Ctor = getRecognizerCtor();
    if (!Ctor) return;

    const recognizer = new Ctor();
    recognizer.lang = lang ?? navigator.language ?? "en-US";
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.maxAlternatives = 1;

    recognizer.onresult = (event) => {
      // Rebuilt from the whole list rather than accumulated across events, so
      // a result the engine revises does not get counted twice.
      let text = "";
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript;
      }
      onTranscriptRef.current(text.trim());
    };

    recognizer.onerror = (event) => {
      // `aborted` is what unmount and stop() raise — not worth surfacing.
      if (event.error === "aborted") return;
      const message =
        errorMessages[event.error] ?? "Speech recognition failed. Try again.";
      setError(message);
      onErrorRef.current?.(message);
    };

    // Fires on stop(), on an error, and when the engine gives up on silence.
    recognizer.onend = () => {
      recognizerRef.current = null;
      setStatus("idle");
    };

    setError(null);
    try {
      recognizer.start();
    } catch {
      setError("Speech recognition could not start. Try again.");
      return;
    }
    recognizerRef.current = recognizer;
    setStatus("listening");
  }, [lang]);

  const stop = useCallback(() => {
    if (!recognizerRef.current) return;
    setStatus("stopping");
    // `stop()` rather than `abort()`: it lets the engine flush what it heard.
    recognizerRef.current.stop();
  }, []);

  return { supported, status, error, start, stop };
}
