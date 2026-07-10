/**
 * The landing shell: sign in / register, pick a deck, and start a match —
 * local vs bot, or online via create/join room codes. Decks come from
 * /api/decks (presets + the signed-in user's saved decks).
 */
import { useEffect, useState } from "react";
import { BASE, type Deck, type DeckListResponse, type School } from "../api.ts";
import type { DeckChoice } from "../online.ts";
import type { UseAuth } from "../useAuth.ts";
import type { OnlineApi } from "../useMatch.ts";
import { schoolOf } from "../schools.ts";
import { SchoolCrest } from "./Pips.tsx";

const SCHOOLS: School[] = ["Evocation", "Abjuration", "Divination"];

interface Props {
  auth: UseAuth;
  deckData: DeckListResponse | null;
  online: OnlineApi;
  /** Connection/room errors (bad code, server down, connection lost) — Home is where they land. */
  error: string | null;
  /** True when the local vs-bot play server is reachable (dev). Hidden in production. */
  hasLocalMatch: boolean;
  onPlayBot: (p0: School, p1: School) => void;
  onResume: () => void;
  onEditDeck: (deck: Deck | null) => void;
  onDeleteDeck: (id: number) => void;
}

/** Encode a deck selection into a <select> value and back. */
const encodeChoice = (d: Deck) => (d.id !== undefined ? `d:${d.id}` : `p:${d.name}`);
const decodeChoice = (v: string): DeckChoice => (v.startsWith("d:") ? { deckId: Number(v.slice(2)) } : { preset: v.slice(2) });

function AuthPanel({ auth }: { auth: UseAuth }) {
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Mail links land here: /?verified=1 after verification, /reset?token=… for resets.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get("verified");
    if (verified !== null) setNotice(verified === "1" ? "Email verified — you're all set." : "That verification link is invalid or expired.");
    if (params.get("sso") === "failed") setNotice("Sign-in via ibokki.com failed — please try again.");
    const token = params.get("token");
    if (location.pathname.endsWith("/reset") && token) {
      setResetToken(token);
      setMode("reset");
    }
    if (verified !== null || token || params.get("sso")) history.replaceState(null, "", BASE);
  }, []);

  if (auth.user) {
    return (
      <div className="panel">
        <h3>Account</h3>
        <div className="dname">{auth.user.username}</div>
        <div className="hint">
          {auth.user.email}
          {auth.user.emailVerified ? "" : " — unverified (check your inbox; needed for password recovery)"}
        </div>
        <button onClick={() => void auth.logout()} data-testid="auth-logout">
          Sign out
        </button>
      </div>
    );
  }

  // SSO deployment: the site owns accounts — one button, no local forms.
  if (auth.oidcEnabled) {
    return (
      <div className="panel">
        <h3>Account</h3>
        <a className="ssobtn" href={`${BASE}api/auth/oidc/login`} data-testid="auth-sso">
          Sign in with ibokki.com
        </a>
        <div className="hint">Your ibokki.com account works everywhere — forum, chat, and the game.</div>
        {notice && <div className="hint">{notice}</div>}
      </div>
    );
  }

  const submit = async () => {
    setNotice(null);
    if (mode === "login") await auth.login(username || email, password);
    if (mode === "register") await auth.register(email, username, password);
    if (mode === "forgot" && (await auth.forgot(email))) setNotice("If that address has a verified account, a reset link is on its way.");
    if (mode === "reset" && resetToken && (await auth.resetPassword(resetToken, password))) setNotice("Password updated.");
  };

  return (
    <div className="panel">
      <h3>{mode === "login" ? "Sign in" : mode === "register" ? "Create account" : mode === "forgot" ? "Forgot password" : "Set a new password"}</h3>
      {(mode === "register" || mode === "forgot") && (
        <label className="field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="auth-email" />
        </label>
      )}
      {(mode === "login" || mode === "register") && (
        <label className="field">
          {mode === "login" ? "User / email" : "Username"}
          <input value={username} onChange={(e) => setUsername(e.target.value)} data-testid="auth-username" />
        </label>
      )}
      {mode !== "forgot" && (
        <label className="field">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="auth-password" />
        </label>
      )}
      <button className="primary" style={{ width: "100%" }} disabled={auth.busy} onClick={() => void submit()} data-testid="auth-submit">
        {mode === "login" ? "Sign in" : mode === "register" ? "Register" : mode === "forgot" ? "Send reset link" : "Save password"}
      </button>
      {auth.error && <div className="formerror">{auth.error}</div>}
      {notice && <div className="hint">{notice}</div>}
      <div className="authlinks">
        {mode !== "login" && <a onClick={() => setMode("login")}>Sign in</a>}
        {mode !== "register" && (
          <a onClick={() => setMode("register")} data-testid="auth-to-register">
            Create account
          </a>
        )}
        {mode === "login" && <a onClick={() => setMode("forgot")}>Forgot?</a>}
      </div>
    </div>
  );
}

export function Home({ auth, deckData, online, error, hasLocalMatch, onPlayBot, onResume, onEditDeck, onDeleteDeck }: Props) {
  const allDecks: Deck[] = [...(deckData?.presets ?? []), ...(deckData?.decks ?? [])];
  const [choice, setChoice] = useState("p:Emberworks");
  const [joinCode, setJoinCode] = useState("");
  const [p0, setP0] = useState<School>("Evocation");
  const [p1, setP1] = useState<School>("Abjuration");
  // Disable the play buttons while the WS handshakes — double-clicks otherwise open
  // two rooms, and a dead server otherwise looks like an unresponsive button.
  const connecting = online.status === "connecting";

  return (
    <div className="home">
      <div className="homecol">
        <div className="panel">
          <h1 className="logo">Ibokki</h1>
          <div className="hint">A stack-based wizard duel.</div>
        </div>
        <AuthPanel auth={auth} />
      </div>

      <div className="homecol">
        <div className="panel">
          <h3>Play online</h3>
          <label className="field">
            Your deck
            <select value={choice} onChange={(e) => setChoice(e.target.value)} data-testid="deck-select">
              {allDecks.map((d) => (
                <option key={encodeChoice(d)} value={encodeChoice(d)}>
                  {d.id !== undefined ? `${d.name} (saved)` : `${d.name} (preset)`}
                </option>
              ))}
            </select>
          </label>
          <button className="primary" style={{ width: "100%" }} disabled={connecting} onClick={() => online.create(decodeChoice(choice))} data-testid="online-create">
            Create room
          </button>
          <label className="field">
            Room code
            <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. QK7XP" maxLength={5} data-testid="online-code-input" />
          </label>
          <button style={{ width: "100%" }} disabled={connecting || joinCode.trim().length < 5} onClick={() => online.join(joinCode, decodeChoice(choice))} data-testid="online-join">
            Join room
          </button>
          <button style={{ width: "100%" }} disabled={connecting} onClick={() => online.createBot(decodeChoice(choice))} data-testid="online-bot">
            Play vs bot
          </button>
          {connecting && <div className="hint">Connecting…</div>}
          {error && <div className="formerror" data-testid="online-error">{error}</div>}
          <div className="hint">No opponent? The bot plays a random archetype deck.</div>
        </div>

        {hasLocalMatch && (
        <div className="panel">
          <h3>Play vs bot</h3>
          <label className="field">
            You
            <select value={p0} onChange={(e) => setP0(e.target.value as School)}>
              {SCHOOLS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Bot
            <select value={p1} onChange={(e) => setP1(e.target.value as School)}>
              {SCHOOLS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <button className="primary" style={{ width: "100%" }} onClick={() => onPlayBot(p0, p1)} data-testid="play-bot">
            Start match
          </button>
          <button style={{ width: "100%" }} onClick={onResume} data-testid="resume-match">
            Resume current match
          </button>
        </div>
        )}
      </div>

      <div className="homecol">
        <div className="panel">
          <h3>Your decks</h3>
          {!auth.user && <div className="hint">Sign in to build and save decks. Presets are always available.</div>}
          <ul className="decklist">
            {(deckData?.presets ?? []).map((d) => (
              <li key={d.name}>
                <span>
                  <SchoolCrest school={schoolOf(d.name)} size={12} /> {d.name} <em>preset</em>
                </span>
                <span className="deckactions">
                  <button onClick={() => onEditDeck(d)} title="Open a copy in the deckbuilder" data-testid={`deck-copy-${d.name}`}>
                    Copy
                  </button>
                </span>
              </li>
            ))}
            {(deckData?.decks ?? []).map((d) => (
              <li key={d.id}>
                <span>{d.name}</span>
                <span className="deckactions">
                  <button onClick={() => onEditDeck(d)}>Edit</button>
                  <button
                    onClick={() => {
                      if (!window.confirm(`Delete "${d.name}"? This can't be undone.`)) return;
                      // Don't leave the play dropdown pointing at a deck that no longer exists.
                      if (choice === `d:${d.id}`) setChoice("p:Emberworks");
                      onDeleteDeck(d.id!);
                    }}
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
          {auth.user && (
            <button className="primary" style={{ width: "100%" }} onClick={() => onEditDeck(null)} data-testid="deck-new">
              New deck
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
