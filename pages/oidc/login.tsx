import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Container, Text, styled, Loading } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { api } from "../../util/api";
import { Auth } from "../../util/auth";
import { Error } from "../../components/Error";
import { Icon } from "../../components/Icon";

const Login = () => {
  const router = useRouter();
  const { token } = Auth.useContainer();
  const [showError, setShowError] = useState(false);
  const acceptAuthMutation = useMutation(
    async (loginChallenge: string) =>
      (
        await api.post<{ redirect: string }>(
          "/user/oidc/login",
          { loginChallenge },
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

    const loginChallenge = new URLSearchParams(window.location.search).get(
      "login_challenge"
    );

    if (token) {
      if (!loginChallenge) {
        setShowError(true);
        return;
      }

      (async () => {
        const { redirect } = await acceptAuthMutation.mutateAsync(
          loginChallenge
        );

        window.location.href = redirect;
      })();
    } else {
      router.push({
        pathname: "/login",
        query: {
          next: router.pathname,
        },
      });
    }
  }, [router, token]);

  if (acceptAuthMutation.isLoading)
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
        <Loading>Logging in with OIDC provider...</Loading>
      </Container>
    );

  if (acceptAuthMutation.isError)
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
            Failed to login with with OIDC provider. Check console for more info
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
      <Error>
        <Icon icon={faWarning} fontSize={30} css={{ color: "$error" }} />
        <Text>
          Failed to login with with OIDC provider, no token was provided.
        </Text>
      </Error>
    </Container>
  ) : (
    <></>
  );
};

export default Login;
