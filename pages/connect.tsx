import { faCheckCircle, faWarning } from "@fortawesome/free-solid-svg-icons";
import { Container, Loading, Text } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { Icon } from "../components/Icon";
import { Error } from "../components/Error";
import { api } from "../util/api";
import { Auth } from "../util/auth";
import { useRouter } from "next/router";

const allowedCallbacks = new Set(["http://localhost:8080/callback"]);

const Connect = () => {
  const router = useRouter();
  const { token } = Auth.useContainer();
  const [showError, setShowError] = useState(false);
  const getConnectToken = useMutation(
    async () =>
      (
        await api.post<{ token: string }>(
          "/user/me/connect",
          {},
          {
            headers: {
              Authorization: token!,
            },
          }
        )
      ).data
  );

  useEffect(() => {
    if (!router.isReady) return;

    if (!token) {
      router.push({
        pathname: "/login",
        query: {
          next: router.pathname,
        },
      });
      return;
    }
    // TODO: Use Router?
    const callback = new URLSearchParams(window.location.search).get(
      "callback"
    );
    if (!callback || !allowedCallbacks.has(callback)) {
      setShowError(true);
      return;
    }

    (async () => {
      const { token } = await getConnectToken.mutateAsync();
      const response = new URLSearchParams({
        token,
      });

      const url = new URL(callback);
      url.hash = response.toString();

      window.location.href = url.toString();
    })();
  }, [getConnectToken, router, token]);

  if (getConnectToken.isLoading)
    return (
      <Container
        css={{
          h: "100vh",
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
        }}
        fluid
      >
        <Loading>Generating a connection token for a FyraLabs service.</Loading>
      </Container>
    );

  if (getConnectToken.isError)
    return (
      <Container
        css={{
          h: "100vh",
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
        }}
        fluid
      >
        <Error>
          <Icon icon={faWarning} fontSize={30} css={{ color: "$error" }} />
          <Text>
            Failed to generate a connection token. Check console for more info.
          </Text>
        </Error>
      </Container>
    );

  if (getConnectToken.isSuccess)
    return (
      <Container
        css={{
          h: "100vh",
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
        }}
        fluid
      >
        <Error
          css={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            mw: 200,
            gap: 5,
          }}
        >
          <Icon
            icon={faCheckCircle}
            fontSize={30}
            css={{ color: "$success" }}
          />
          <Text>Redirecting back to a FyraLabs service.</Text>
        </Error>
      </Container>
    );

  return showError ? (
    <Container
      css={{
        h: "100vh",
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
      }}
      fluid
    >
      <Error
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          mw: 200,
          gap: 5,
        }}
      >
        <Icon icon={faWarning} fontSize={30} css={{ color: "$error" }} />
        <Text>
          Failed to generate a connection token, the callback URL is incorrect.
        </Text>
      </Error>
    </Container>
  ) : (
    <></>
  );
};

export default Connect;
