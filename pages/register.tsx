import {
  Button,
  Checkbox,
  Col,
  Container,
  Input,
  Row,
  Spacer,
  Text,
  Image,
  Link,
  Loading,
} from "@nextui-org/react";
import NextLink from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "react-query";
import { api } from "../util/api";
import axios from "axios";
import { useRouter } from "next/router";
import { Auth } from "../util/auth";
import { useEffect } from "react";
import Head from "next/head";
import { AuthForm } from "../components/AuthForm";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  agree: boolean;
}

const schema = z.object({
  name: z
    .string()
    .min(1, "Name must be at least 1 character")
    .max(256, "Name must be at most 256 characters"),
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
  agree: z.boolean().refine((v) => !!v),
});

const Register = () => {
  const router = useRouter();
  const { isLoading, mutateAsync } = useMutation(
    async (data: { name: string; email: string; password: string }) =>
      (await api.post<{ token: string }>("/user/register", data)).data
  );
  const { register, handleSubmit, formState, control, setError } =
    useForm<RegisterForm>({
      resolver: zodResolver(schema),
      mode: "onTouched",
      defaultValues: {
        agree: false,
      },
    });
  const { token, setToken } = Auth.useContainer();

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
        <title>Register</title>
      </Head>
      <Row css={{ minHeight: "100vh" }} align="center">
        <Col
          css={{
            "@smMax": {
              display: "none",
            },
          }}
        >
          <Image
            style={{ maxWidth: 500, margin: "auto" }}
            src="/dawn.svg"
            showSkeleton={false}
            alt="Dawn Graphic"
          />
        </Col>
        <Col
          css={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AuthForm
            css={{ margin: "auto", display: "flex", flexDirection: "column" }}
            onSubmit={handleSubmit(async (data) => {
              try {
                const res = await mutateAsync(data);
                setToken(res.token);
              } catch (e) {
                if (axios.isAxiosError(e)) {
                  switch (e.response?.status) {
                    case 409: {
                      setError("email", {
                        message: "A user with that email already exists",
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
                Create your{" "}
                <Text
                  span
                  css={{
                    textGradient: "125deg, $pink500 20%, $blue500 100%",
                  }}
                  weight="black"
                >
                  FyraLabs
                </Text>{" "}
                Account.
              </Text>
              <Text>One account. For all of FyraLabs and beyond.</Text>
            </div>
            <Spacer y={1.5} />
            <Input
              labelPlaceholder={
                formState.errors.name
                  ? "Name - " + formState.errors.name?.message
                  : "Name"
              }
              css={{ maxW: 500 }}
              status={formState.errors.name ? "error" : undefined}
              {...register("name")}
            />
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
            <Controller
              name="agree"
              control={control}
              render={({ field }) => {
                return (
                  <Checkbox
                    ref={field.ref}
                    isSelected={field.value}
                    name={field.name}
                    onFocusChange={() => field.onBlur()}
                    onChange={(e) => field.onChange(e)}
                  >
                    <Text>
                      I agree to the <Link href="#">Terms & Conditions</Link>
                    </Text>
                  </Checkbox>
                );
              }}
            />
            <Spacer y={1.5} />
            <Button type="submit" disabled={!formState.isValid || isLoading}>
              {isLoading ? <Loading color="white" size="sm" /> : "Register"}
            </Button>
            <Spacer y={0.5} />
            <NextLink
              href={{
                pathname: "/login",
                query: router.query,
              }}
              passHref
            >
              <Link css={{ fontSize: 15 }}>Have an account?</Link>
            </NextLink>
          </AuthForm>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
