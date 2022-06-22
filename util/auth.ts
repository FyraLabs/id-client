import { createContainer } from "@fyralabs/state";
import { useEffect, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";
import decode from "jwt-decode";
import { useQuery } from "react-query";
import { api } from "./api";
import axios from "axios";

export const Auth = createContainer(() => {
  const [token, setToken] = useLocalStorage<string | null>(
    "fyraid-token",
    null
  );

  // Check if the token is valid
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        await api.get("/user/me", {
          headers: {
            Authorization: token!,
          },
        });
      } catch (e) {
        if (
          axios.isAxiosError(e) &&
          // TODO: Not sure why I got a 400 before, I'll check soon
          (e.response?.status === 400 || e.response?.status === 401)
        ) {
          setToken(null);
        }
      }
    })();
  }, [token]);

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
