import {
  Button,
  Col,
  Container,
  Input,
  Row,
  Spacer,
  Text,
  Image,
  styled,
  Link,
  Loading,
} from "@nextui-org/react";
import NextLink from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "react-query";
import { api } from "../util/api";
import axios from "axios";
import { Auth } from "../util/auth";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const Form = styled("form");

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

  useEffect(() => {
    if (token) router.push("/dashboard");
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
          }}
        >
          <Form
            css={{ margin: "auto", display: "flex", flexDirection: "column" }}
            onSubmit={handleSubmit(async (data) => {
              try {
                const res = await mutateAsync(data);
                if (res.type === "session") {
                  setToken(res.data.token);
                } else if (res.type === "2fa") {
                  // TODO: Preform 2FA Flow
                }
                router.push("/dashboard");
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
            <Input
              labelPlaceholder={
                formState.errors.email
                  ? "Email - " + formState.errors.email?.message
                  : "Email"
              }
              css={{ maxW: 500 }}
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
              css={{ maxW: 500 }}
              status={formState.errors.password ? "error" : undefined}
              {...register("password")}
            />
            <Spacer y={1.5} />
            <Button type="submit" disabled={!formState.isValid || isLoading}>
              {isLoading ? <Loading color="white" size="sm" /> : "Login"}
            </Button>
            <Spacer y={0.5} />
            <NextLink href="/register" passHref>
              <Link css={{ fontSize: 15 }}>Dont have an account?</Link>
            </NextLink>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
