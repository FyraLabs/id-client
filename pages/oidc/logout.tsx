import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Container, Text, styled, Loading } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { api } from "../../util/api";
import { Auth } from "../../util/auth";

const Icon = styled(FontAwesomeIcon);
const Error = styled("div");

const Logout = () => {
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const logoutMutation = useMutation(
    async (logoutChallenge: string) =>
      (await api.post("/user/oidc/logout", { logoutChallenge })).data
  );

  useEffect(() => {
    if (!router.isReady) return;

    const logoutChallenge = new URLSearchParams(window.location.search).get(
      "logout_challenge"
    );

    if (!logoutChallenge) {
      setShowError(true);
      return;
    }

    logoutMutation.mutate(logoutChallenge);
  }, [router]);

  if (logoutMutation.isLoading)
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
        <Loading>Logging out with OIDC provider...</Loading>
      </Container>
    );

  if (logoutMutation.isError)
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
          <Icon icon={faWarning} fontSize={30} css={{ color: "$error" }} />
          <Text>
            Failed to logout with with OIDC provider. Check console for more
            info
          </Text>
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
          Failed to logout with with OIDC provider, no token was provided.
        </Text>
      </Error>
    </Container>
  ) : (
    <></>
  );
};

export default Logout;
