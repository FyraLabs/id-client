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
} from "@nextui-org/react";
import NextLink from "next/link";

const Centered = styled("div");

const Login = () => {
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
          <Centered
            css={{ margin: "auto", display: "flex", flexDirection: "column" }}
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
            <Input labelPlaceholder="Email" css={{ maxW: 500 }} type="email" />
            <Spacer y={1.5} />
            <Input.Password labelPlaceholder="Password" css={{ maxW: 500 }} />
            <Spacer y={1.5} />
            <Button css={{ maxW: 500 }}>Login</Button>
            <Spacer y={0.5} />
            <NextLink href="/register">
              <Link css={{ fontSize: 15 }}>Dont have an account?</Link>
            </NextLink>
          </Centered>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
