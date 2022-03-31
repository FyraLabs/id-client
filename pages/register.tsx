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

const Centered = styled("div");

const Login = () => {
  return (
    <Container>
      <Row css={{ minHeight: "100vh" }} align="center">
        <Col>
          <Image style={{ maxWidth: 500, margin: "auto" }} src="/dawn.svg" />
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
            <Input labelPlaceholder="Name" css={{ maxW: 500 }} />
            <Spacer y={1.5} />
            <Input labelPlaceholder="Email" css={{ maxW: 500 }} type="email" />
            <Spacer y={1.5} />
            <Input.Password labelPlaceholder="Password" css={{ maxW: 500 }} />
            <Spacer y={1.5} />
            <Checkbox>
              <Text>
                I agree to the <Link href="#">Terms & Conditions</Link>
              </Text>
            </Checkbox>
            <Spacer y={1.5} />
            <Button css={{ maxW: 500 }}>Register</Button>
          </Centered>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
