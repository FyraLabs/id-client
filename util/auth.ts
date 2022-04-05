import { createContainer } from "@fyralabs/state";
import { useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";
import decode from "jwt-decode";

export const Auth = createContainer(() => {
  const [token, setToken] = useLocalStorage<string | null>(
    "fyraid-token",
    null
  );

  const sessionID = useMemo(() => {
    if (!token) return null;

    return (decode(token) as { sub: string }).sub;
  }, [token]);

  return {
    token,
    setToken,
    sessionID,
  };
});
