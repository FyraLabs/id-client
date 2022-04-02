import { createContainer } from "@fyralabs/state";
import { useLocalStorage } from "usehooks-ts";

export const Auth = createContainer(() => {
  const [token, setToken] = useLocalStorage<string | null>(
    "fyraid-token",
    null
  );

  return {
    token,
    setToken,
  };
});
