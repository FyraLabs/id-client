import { createContainer } from "@fyralabs/state";
import { useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";
import decode from "jwt-decode";
import { useQuery } from "react-query";
import { api } from "./api";

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

export const useMe = () => {
  const { token } = Auth.useContainer();

  const user = useQuery(
    ["me"],
    async () =>
      (
        await api.get<{
          id: string;
          email: string;
          name: string;
          emailVerified: boolean;
          avatarURL: string;
        }>("/user/me", {
          headers: {
            Authorization: token!,
          },
        })
      ).data,
    {
      enabled: !!token,
    }
  );

  return user;
};
