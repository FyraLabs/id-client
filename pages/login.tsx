import {
  Button,
  Col,
  Container,
  Input,
  Row,
  Spacer,
  Text,
  Image,
  Link,
  Loading,
  Card,
} from "@nextui-org/react";
import NextLink from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "react-query";
import { api } from "../util/api";
import axios from "axios";
import { Auth } from "../util/auth";
import { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { CodeInput } from "../components/CodeInput";
import { AuthForm } from "../components/AuthForm";

interface LoginForm {
  email: string;
  password: string;
}

const schema = z.object({
  email: z
    .string()
    .email("Email must be a valid email address")
    .min(5)
    .min(1, "Email must be at least 5 characters")
    .max(256)
    .max(256, "Email must be at most 256 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(256, "Password must be at most 256 characters"),
});

const SecondFactorCard: FC<{
  name: string;
  type: "totp";
  onClick: () => void;
}> = ({ name, onClick }) => {
  return (
    <Card clickable onClick={onClick}>
      <Row css={{ alignItems: "center", gap: 10 }}>
        <FontAwesomeIcon icon={faClock} fixedWidth fontSize={20} />
        <Text weight="bold">{name}</Text>
      </Row>
    </Card>
  );
};

const TOTPVerify: FC<{
  totpToken: string;
  methodID: string;
}> = ({ totpToken, methodID }) => {
  const router = useRouter();
  const { token, setToken } = Auth.useContainer();
  const confirmMethod = useMutation(
    async ({ code }: { code: string }) =>
      (
        await api.post<{
          token: string;
        }>(
          "/user/login/2fa",
          {
            method: "totp",
            token: totpToken,
            methodID,
            data: {
              code,
            },
          },
          {
            headers: {
              Authorization: token!,
            },
          }
        )
      ).data
  );

  const [error, setError] = useState<string | null>(null);

  return (
    <CodeInput
      error={error ? "Invalid code" : undefined}
      onChange={() => {
        setError(null);
      }}
      onCode={async (code) => {
        try {
          const { token } = await confirmMethod.mutateAsync({
            code,
          });
          setToken(token);
        } catch (e) {
          if (axios.isAxiosError(e)) {
            if (e.response?.status === 401) {
              setError("Invalid Code");
            }

            setError("Unknown Error");
          }
        }
      }}
    />
  );
};

const Login = () => {
  const router = useRouter();
  const { isLoading, mutateAsync } = useMutation(
    async (data: { email: string; password: string }) =>
      (
        await api.post<
          | { type: "session"; data: { token: string } }
          | {
              type: "2fa";
              data: {
                methods: {
                  id: string;
                  type: "totp";
                  name: string;
                }[];
                token: string;
              };
            }
        >("/user/login", data)
      ).data
  );
  const { register, handleSubmit, formState, setError } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });
  const { token, setToken } = Auth.useContainer();
  const [twoFactorState, setTwoFactorState] = useState<{
    methods: {
      id: string;
      type: "totp";
      name: string;
    }[];
    token: string;
  } | null>(null);
  const [selectedTwoFactorID, setSelectedTwoFactorID] = useState<string | null>(
    null
  );
  const method = twoFactorState?.methods?.find(
    (method) => method.id === selectedTwoFactorID
  );

  useEffect(() => {
    if (!router.isReady) return;
    if (token) {
      const next = router.query["next"];
      if (typeof next === "string" && next.startsWith("/")) router.push(next);
      else router.push("/dashboard");
    }
  }, [router, token]);

  return (
    <Container>
      <Head>
        <title>Login</title>
      </Head>
      <Row css={{ minHeight: "100vh" }} align="center">
        <Col>
          {/* NOTE: Accent #0070f3 */}
          <Image
            style={{ maxWidth: 500, margin: "auto" }}
            src="/space.svg"
            showSkeleton={false}
            alt="Space Graphic"
          />
        </Col>
        <Col
          css={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>
            <div>
              <Text h1 size={35}>
                Welcome back to{" "}
                <Text
                  span
                  css={{
                    textGradient: "125deg, $pink500 20%, $blue500 100%",
                  }}
                  weight="black"
                >
                  FyraLabs
                </Text>
              </Text>
              <Text>One account. For all of FyraLabs and beyond.</Text>
            </div>
            <Spacer y={1.5} />
            {selectedTwoFactorID ? (
              method!.type === "totp" ? (
                <Col
                  css={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <TOTPVerify
                    totpToken={twoFactorState!.token}
                    methodID={selectedTwoFactorID}
                  />
                  <Spacer y={1.5} />
                  <Button onClick={() => setSelectedTwoFactorID(null)} flat>
                    Back
                  </Button>
                </Col>
              ) : (
                <></>
              )
            ) : twoFactorState ? (
              <Col
                css={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Col
                  css={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {twoFactorState.methods.map((method) => (
                    <SecondFactorCard
                      key={method.id}
                      name={method.name}
                      type={method.type}
                      onClick={() => setSelectedTwoFactorID(method.id)}
                    />
                  ))}
                </Col>
                <Spacer y={1.5} />
                <Text>
                  No access to any of your 2FA methods?{" "}
                  <Link href="mailto:support@fyralabs.com">
                    Contact support.
                  </Link>
                </Text>
              </Col>
            ) : (
              <AuthForm
                css={{ display: "flex", flexDirection: "column" }}
                onSubmit={handleSubmit(async (data) => {
                  try {
                    const res = await mutateAsync(data);
                    if (res.type === "session") {
                      setToken(res.data.token);
                      router.push("/dashboard");
                    } else if (res.type === "2fa") {
                      setTwoFactorState(res.data);
                    }
                  } catch (e) {
                    if (axios.isAxiosError(e)) {
                      switch (e.response?.status) {
                        case 404: {
                          setError("email", {
                            message: "A user with that email doesn't exist",
                          });
                          return;
                        }

                        case 401: {
                          setError("password", {
                            message: "Incorrect password",
                          });
                          return;
                        }
                      }
                    }

                    throw e;
                  }
                })}
              >
                <Input
                  labelPlaceholder={
                    formState.errors.email
                      ? "Email - " + formState.errors.email?.message
                      : "Email"
                  }
                  type="email"
                  status={formState.errors.email ? "error" : undefined}
                  {...register("email")}
                />
                <Spacer y={1.5} />
                <Input.Password
                  labelPlaceholder={
                    formState.errors.password
                      ? "Password - " + formState.errors.password?.message
                      : "Password"
                  }
                  status={formState.errors.password ? "error" : undefined}
                  {...register("password")}
                />
                <Spacer y={1.5} />
                <Button
                  type="submit"
                  disabled={!formState.isValid || isLoading}
                >
                  {isLoading ? <Loading color="white" size="sm" /> : "Login"}
                </Button>
                <Spacer y={0.5} />
                <NextLink
                  href={{
                    pathname: "/register",
                    query: router.query,
                  }}
                  passHref
                >
                  <Link css={{ fontSize: 15 }}>Dont have an account?</Link>
                </NextLink>
              </AuthForm>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
