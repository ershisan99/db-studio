import { createSelectors } from "@/lib/create-selectors";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionFields = {
  username: string;
  password: string;
  host: string;
  type: string;
  port: string;
  database: string;
  ssl: string;
  id: number;
};
type SessionConnectionString = {
  id: number;
  connectionString: string;
  type: string;
};
type Session = SessionFields | SessionConnectionString;

type SesionState = {
  sessions: Session[];
  currentSessionId: number | null;
  setCurrentSessionId: (sessionId: number | null) => void;
  addSession: (
    session: Omit<SessionConnectionString, "id"> | Omit<SessionFields, "id">,
  ) => void;
  removeSession: (sessionId: number) => void;
};

const useSessionStoreBase = create<SesionState>()(
  persist(
    (set) => {
      return {
        currentSessionId: null,
        setCurrentSessionId: (sessionId) => {
          set(() => ({ currentSessionId: sessionId }));
        },
        sessions: [],
        addSession: (session) => {
          set((state) => {
            const id = state.sessions.length
              ? Math.max(...state.sessions.map((s) => s.id)) + 1
              : 1;
            let isExisting = false;
            for (const s of state.sessions) {
              if (
                "connectionString" in s &&
                "connectionString" in session &&
                s.connectionString === session.connectionString
              ) {
                isExisting = true;
                break;
              }
              if ("host" in s && "host" in session && s.host === session.host)
                isExisting = true;
            }
            if (isExisting) {
              toast.error("Session already exists");
              return state;
            }
            return {
              sessions: [...state.sessions, { ...session, id }],
              currentSessionId: id,
            };
          });
        },
        removeSession: (sessionId) => {
          set((state) => ({
            sessions: state.sessions.filter((s) => s.id !== sessionId),
          }));
        },
      };
    },
    {
      name: "db-session-storage",
    },
  ),
);

export const useSessionStore = createSelectors(useSessionStoreBase);
