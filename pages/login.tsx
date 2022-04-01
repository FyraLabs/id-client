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
  const { isLoading, mutateAsync } = useMutation(
    async (data: { email: string; password: string }) =>
      (await api.post("/user/login", data)).data
  );
  const { register, handleSubmit, formState, setError } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  return (
    <Container>
      <Row css={{ minHeight: "100vh" }} align="center">
        <Col>
          <Image
            style={{ maxWidth: 500, margin: "auto" }}
            src="/space.svg"
            showSkeleton={false}
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
                await mutateAsync(data);
              } catch (e) {
                if (axios.isAxiosError(e)) {
                  switch (e.response?.status) {
                    case 404: {
                      setError("email", {
                        message: "A user with that email doesn't exist",
                      });
                      break;
                    }

                    case 401: {
                      setError("password", {
                        message: "Incorrect password",
                      });
                      break;
                    }
                  }
                }
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
            <Button
              css={{ maxW: 500 }}
              type="submit"
              flat={!isLoading && !formState.isValid}
              disabled={!formState.isValid || isLoading}
            >
              {isLoading ? <Loading color="white" size="sm" /> : "Login"}
            </Button>
            <Spacer y={0.5} />
            <NextLink href="/register">
              <Link css={{ fontSize: 15 }}>Dont have an account?</Link>
            </NextLink>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
