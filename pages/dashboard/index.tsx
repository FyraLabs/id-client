import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComputer,
  faFingerprint,
  faKey,
  faMobileAlt,
  faSave,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  Card,
  Col,
  Collapse,
  Container,
  Input,
  Modal,
  Row,
  Spacer,
  styled,
  Text,
  Tooltip,
  useModal,
  User,
  Image,
  Loading,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { Auth } from "../../util/auth";
import { FC, Suspense, useEffect, useMemo } from "react";
import { useQuery } from "react-query";
import { api } from "../../util/api";
import dynamic from "next/dynamic";
import dayjs from "dayjs";

const HeadingRow = styled("div");

interface UpdatePasswordForm {
  currentPassword: string;
  newPassword: string;
}

const schema = z.object({
  currentPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(256, "Password must be at most 256 characters"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(256, "Password must be at most 256 characters"),
});

const UpdatePassword = () => {
  const { register, handleSubmit, formState, setError } =
    useForm<UpdatePasswordForm>({
      resolver: zodResolver(schema),
      mode: "onTouched",
    });

  const isLoading = false;

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <Modal.Header>
        <Text size={18} weight="bold">
          Update Password
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Input.Password
          label={"Current Password"}
          placeholder="••••••••"
          // status={formState.errors.currentPassword ? "error" : undefined}
          bordered
          helperText={formState.errors.currentPassword?.message}
          helperColor="error"
          {...register("currentPassword")}
        />
        <Input.Password
          label={"New Password"}
          placeholder="••••••••"
          // status={formState.errors.newPassword ? "error" : undefined}
          helperText={formState.errors.newPassword?.message}
          helperColor="error"
          bordered
          {...register("newPassword")}
        />
        <Spacer y={0.1} />
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit" disabled={!formState.isValid || isLoading} auto>
          Confirm
        </Button>
      </Modal.Footer>
    </form>
  );
};

const Header = styled("div");
const Circle = styled("div");

const BasicInfo = () => {
  const { token } = Auth.useContainer();
  const user = useQuery(
    ["me"],
    async () =>
      (
        await api.get<{ id: string; email: string; name: string }>("/user/me", {
          headers: {
            Authorization: token!,
          },
        })
      ).data,
    {
      enabled: !!token,
    }
  );

  const { setVisible, bindings } = useModal();

  if (user.isLoading) return <Loading>Loading Basic Profile...</Loading>;
  if (user.isError)
    return (
      <Error
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          mw: 200,
          gap: 5,
          mx: "auto",
        }}
      >
        <Icon icon={faWarning} fontSize={30} css={{ color: "$error" }} />
        <Text>Failed to load basic user data, check console for more info</Text>
      </Error>
    );

  return (
    <>
      <Modal
        aria-labelledby="Update Password"
        aria-describedby="Update your password"
        closeButton
        blur
        {...bindings}
      >
        <UpdatePassword />
      </Modal>
      <Card>
        <Text size={20} weight="bold">
          Basic Info
        </Text>
        <Spacer y={0.5} />
        <Input
          label="Name"
          placeholder="Lea Gray"
          underlined
          initialValue={user.data?.name}
          contentRight={<Icon icon={faSave} />}
        />
        <Spacer y={1} />
        <Input
          label="Email"
          placeholder="lea@fyralabs.com"
          underlined
          initialValue={user.data?.email}
        />
        <Spacer y={1} />
        <Button color="warning" flat onClick={() => setVisible(true)}>
          Update Password
        </Button>
        <Spacer y={0.5} />
      </Card>
    </>
  );
};

const SessionRow: FC<{}> = () => {
  return (
    <Collapse
      contentLeft={
        <FontAwesomeIcon icon={faMobileAlt} fixedWidth fontSize={20} />
      }
      title={<Text weight="bold">iPhone</Text>}
      subtitle="Los Angeles, CA"
    >
      <Row>
        <Col>
          <Text weight="bold">IP</Text>
          <Text>1.1.1.1</Text>
        </Col>
        <Col>
          <Text weight="bold">Last Used</Text>
          <Text>Yesterday, at 7:08am</Text>
        </Col>
      </Row>

      <Spacer y={1} />

      <Button color="error" css={{ w: "100%" }} auto>
        Revoke Session
      </Button>
    </Collapse>
  );
};

const SessionInfo = () => {
  const { token } = Auth.useContainer();

  const sessions = useQuery(
    ["me", "session"],
    async () =>
      (
        await api.get<
          {
            id: string;
            ip: string;
            userAgent: string;
            createdAt: string;
            lastUsedAt: string;
          }[]
        >("/user/me/session", {
          headers: {
            Authorization: token!,
          },
        })
      ).data,
    {
      enabled: !!token,
    }
  );

  const sessionData = useMemo(
    () =>
      sessions.data?.map((session) => ({
        ...session,
        // createdAt: dayjs.(session.createdAt),
        // lastUsedAt: dayjs(session.lastUsedAt),
      })),
    [sessions]
  );

  console.log(sessionData);

  if (sessions.isLoading) return <Loading>Loading Sessions...</Loading>;
  if (sessions.isError)
    return (
      <Error
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          mw: 200,
          gap: 5,
          mx: "auto",
        }}
      >
        <Icon icon={faWarning} fontSize={30} css={{ color: "$error" }} />
        <Text>Failed to load session data, check console for more info</Text>
      </Error>
    );

  return (
    <Card>
      <Text size={20} weight="bold">
        Sessions
      </Text>
      <Collapse.Group css={{ p: 0 }}>
        <SessionRow />
      </Collapse.Group>
    </Card>
  );
};

const Error = styled("div");
const Icon = styled(FontAwesomeIcon);

const Main = () => {
  const router = useRouter();
  const { token } = Auth.useContainer();
  const user = useQuery(
    ["me"],
    async () =>
      (
        await api.get<{ id: string; email: string; name: string }>("/user/me", {
          headers: {
            Authorization: token!,
          },
        })
      ).data,
    {
      enabled: !!token,
    }
  );

  useEffect(() => {
    if (!token) router.push("/login");
  }, []);

  if (!token) return <></>;

  if (user.isLoading)
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
        <Loading>Loading User Data...</Loading>
      </Container>
    );

  if (user.isError)
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
          <Text>Failed to load user data, check console for more info</Text>
        </Error>
      </Container>
    );

  return (
    <Container
      css={{ mw: 600, display: "flex", flexDirection: "column", gap: 25 }}
    >
      <Header
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 25,
        }}
      >
        <Image
          src="https://cdn.discordapp.com/avatars/228736069091196928/cd771f5f824f380a4f82ce8f8e90be58.webp?size=512"
          objectFit="cover"
          css={{ borderRadius: "50%", aspectRatio: "1 / 1", maxW: 125 }}
        />
        <Text h1>Welcome Back, {user.data?.name}</Text>
      </Header>
      {/* <Text size={30} weight="bold">
        General
      </Text>

      <Text size={30} weight="bold">
        Security
      </Text>
      <Text size={30} weight="bold">
        Privacy
      </Text>
      <Text size={30} weight="bold">
        Connected Apps
      </Text>
      <Text size={30} weight="bold">
        Payments
      </Text> */}

      <BasicInfo />
      <SessionInfo />

      <Card>
        <Text size={20} weight="bold">
          2FA
        </Text>
        <Spacer y={0.5} />
        <Collapse.Group css={{ p: 0 }}>
          <Collapse
            contentLeft={
              <FontAwesomeIcon icon={faKey} fixedWidth fontSize={20} />
            }
            title={<Text weight="bold">Lea's Security Key</Text>}
            subtitle="Yesterday, at 7:08am"
          >
            <Button color="error" css={{ w: "100%" }} auto>
              Remove 2FA Method
            </Button>
          </Collapse>
          <Collapse
            contentLeft={
              <FontAwesomeIcon icon={faFingerprint} fixedWidth fontSize={20} />
            }
            title={<Text weight="bold">Jade's Fingerprint Scanner</Text>}
            subtitle="Today, at 12:21pm"
          >
            <Button color="error" css={{ w: "100%" }} auto>
              Remove 2FA Method
            </Button>
          </Collapse>
        </Collapse.Group>
        <Spacer y={0.5} />
      </Card>
    </Container>
  );
};

//TODO: Find a better way of preventing SSR and client mismatch
export default dynamic(async () => Main);
