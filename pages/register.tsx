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
  styled,
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

const Form = styled("form");

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
  const { isLoading, mutateAsync } = useMutation(
    async (data: { name: string; email: string; password: string }) =>
      (await api.post("/user/register", data)).data
  );
  const { register, handleSubmit, formState, control, setError } =
    useForm<RegisterForm>({
      resolver: zodResolver(schema),
      mode: "onTouched",
    });

  return (
    <Container>
      <Row css={{ minHeight: "100vh" }} align="center">
        <Col>
          <Image
            style={{ maxWidth: 500, margin: "auto" }}
            src="/dawn.svg"
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
                    checked={field.value}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    <Text>
                      I agree to the <Link href="#">Terms & Conditions</Link>
                    </Text>
                  </Checkbox>
                );
              }}
            />
            <Spacer y={1.5} />
            <Button
              css={{ maxW: 500 }}
              type="submit"
              flat={!isLoading && !formState.isValid}
              disabled={!formState.isValid || isLoading}
            >
              {isLoading ? <Loading color="white" size="sm" /> : "Register"}
            </Button>
            <Spacer y={0.5} />
            <NextLink href="/login">
              <Link css={{ fontSize: 15 }}>Have an account?</Link>
            </NextLink>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
