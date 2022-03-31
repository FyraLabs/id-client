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
} from "@nextui-org/react";
import NextLink from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const Form = styled("form");

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  agree: boolean;
}

const schema = z.object({
  name: z.string().min(1).max(256),
  email: z.string().email().min(5).max(256),
  password: z.string().min(8).max(256),
  agree: z.literal(true),
});

const Register = () => {
  const { register, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
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
            onSubmit={handleSubmit((data) => console.log(data))}
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
            <Checkbox {...register("agree")}>
              <Text color={formState.errors.agree ? "error" : undefined}>
                I agree to the <Link href="#">Terms & Conditions</Link>
              </Text>
            </Checkbox>
            <Spacer y={1.5} />
            <Button
              css={{ maxW: 500 }}
              // disabled={!formState.isValid}
              type="submit"
            >
              Register
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
