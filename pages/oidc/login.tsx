import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Container, Text, styled } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Auth } from "../../util/auth";

const Icon = styled(FontAwesomeIcon);
const Error = styled("div");

const Login = () => {
  const router = useRouter();
  const { token } = Auth.useContainer();

  useEffect(() => {
    if (!router.isReady) return;

    if (token) {
      // TODO: Accept auth request...
    } else {
      router.push({
        pathname: "/login",
        query: {
          next: router.pathname,
        },
      });
    }
  }, [router, token]);

  // if (verifyEmail.isLoading)
  //   return (
  //     <Container
  //       css={{
  //         h: "100vh",
  //         display: "flex",
  //         justifyContent: "center",
  //         alignContent: "center",
  //       }}
  //       fluid
  //     >
  //       <Loading>Logging in with OIDC provider...</Loading>
  //     </Container>
  // );

  // if (verifyEmail.isError)
  //   return (
  //     <Container
  //       css={{
  //         h: "100vh",
  //         display: "flex",
  //         justifyContent: "center",
  //         alignContent: "center",
  //       }}
  //       fluid
  //     >
  //       <Error
  //         css={{
  //           display: "flex",
  //           flexDirection: "column",
  //           alignItems: "center",
  //           textAlign: "center",
  //           mw: 200,
  //           gap: 5,
  //         }}
  //       >
  //         <Icon icon={faWarning} fontSize={30} css={{ color: "$error" }} />
  //         <Text>
  //           Failed to login with with OIDC provider.
  //           Check console for more info
  //         </Text>
  //       </Error>
  //     </Container>
  //   );

  const showError = false;

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
          Failed to login with with OIDC provider, no token was provided.
        </Text>
      </Error>
    </Container>
  ) : (
    <></>
  );
};

export default Login;
