import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useLoginMutation } from "@/services/db";
import { useSessionStore } from "@/state/db-session-store";
import { memo, useMemo } from "react";
import { toast } from "sonner";

function RawSessionSelector() {
  const sessions = useSessionStore.use.sessions();
  const currentSessionId = useSessionStore.use.currentSessionId();
  const setCurrentSessionId = useSessionStore.use.setCurrentSessionId();
  const { mutate } = useLoginMutation();

  const handleSessionSelected = (sessionId: string) => {
    const session = sessions.find((s) => s.id === Number.parseInt(sessionId));
    if (!session) {
      toast.error("Invalid session");
      return;
    }
    setCurrentSessionId(session.id);
    mutate(session);
  };

  const mappedSessions = useMemo(() => {
    return sessions?.map((session) => {
      const text =
        "connectionString" in session
          ? session.connectionString
          : `${session.host}:${session.port}/${session.database}`;
      return (
        <SelectItem value={session.id.toString()} key={session.id}>
          {text}
        </SelectItem>
      );
    });
  }, [sessions]);

  if (!sessions.length) {
    return null;
  }

  return (
    <Select
      value={currentSessionId ? currentSessionId.toString() : ""}
      onValueChange={handleSessionSelected}
    >
      <SelectTrigger className="max-w-full">
        <SelectValue placeholder="Select a Database" />
      </SelectTrigger>
      <SelectContent>{mappedSessions}</SelectContent>
    </Select>
  );
}

const SessionSelector = memo(RawSessionSelector);

SessionSelector.displayName = "SessionSelector";

export { SessionSelector };
