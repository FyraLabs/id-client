import { faCheckCircle, faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Container, Loading, styled, Text } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { api } from "../util/api";

const Icon = styled(FontAwesomeIcon);
const Error = styled("div");

const VerifyEmail = () => {
  const [showError, setShowError] = useState(false);
  const verifyEmail = useMutation(async (token: string) => {
    (await api.post("/user/verifyEmail", { token })).data;
  });

  useEffect(() => {
    // TODO: Use Router?
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setShowError(true);
      return;
    }

    verifyEmail.mutate(token);
  }, [verifyEmail]);

  if (verifyEmail.isLoading)
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
        <Loading>Verifying Email Address...</Loading>
      </Container>
    );

  if (verifyEmail.isError)
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
            Failed to verify email address, this token is probably expired.
            Check console for more info
          </Text>
        </Error>
      </Container>
    );

  if (verifyEmail.isSuccess)
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
          <Text>
            This email is now linked to your account! You may close this window.
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
        <Text>Failed to verify email address, no token was provided.</Text>
      </Error>
    </Container>
  ) : (
    <></>
  );
};

export default VerifyEmail;
