import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDesktopAlt,
  faFingerprint,
  faKey,
  faMobileAlt,
  faPaperPlane,
  faSave,
  faTabletAlt,
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
  Link,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { Auth } from "../../util/auth";
import { FC, Suspense, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { api } from "../../util/api";
import dynamic from "next/dynamic";
import dayjs, { Dayjs } from "dayjs";
import calendarPlugin from "dayjs/plugin/calendar";
import axios from "axios";

dayjs.extend(calendarPlugin);

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

const UpdatePassword: FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const { register, handleSubmit, formState, setError } =
    useForm<UpdatePasswordForm>({
      resolver: zodResolver(schema),
      mode: "onTouched",
    });

  const { token } = Auth.useContainer();

  const { isLoading, mutateAsync } = useMutation(
    async (data: { currentPassword: string; newPassword: string }) =>
      (
        await api.post<{ token: string }>("/user/me/password", data, {
          headers: {
            Authorization: token!,
          },
        })
      ).data
  );

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        try {
          await mutateAsync(data);
          closeModal();
        } catch (e) {
          if (axios.isAxiosError(e)) {
            switch (e.response?.status) {
              case 401: {
                setError("currentPassword", {
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
      <Modal.Header>
        <Text size={18} weight="bold">
          Update Password
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Input.Password
          label={"Current Password"}
          placeholder="••••••••"
          status={formState.errors.currentPassword ? "error" : undefined}
          bordered
          helperText={formState.errors.currentPassword?.message}
          helperColor="error"
          {...register("currentPassword")}
        />
        <Input.Password
          label={"New Password"}
          placeholder="••••••••"
          status={formState.errors.newPassword ? "error" : undefined}
          helperText={formState.errors.newPassword?.message}
          helperColor="error"
          bordered
          {...register("newPassword")}
        />
        <Spacer y={0.1} />
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit" disabled={!formState.isValid || isLoading} auto>
          {isLoading ? <Loading color="white" size="sm" /> : "Confirm"}
        </Button>
      </Modal.Footer>
    </form>
  );
};

const Header = styled("div");
const ClearButton = styled("button");

const VerifyRow = styled("div");

const updateNameSchema = z.object({
  name: z
    .string()
    .min(1, "Name must be at least 1 character")
    .max(256, "Name must be at most 256 characters"),
});

const UpdateName: FC<{ name: string }> = ({ name }) => {
  const { token } = Auth.useContainer();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState, setValue, watch } = useForm<{
    name: string;
  }>({
    resolver: zodResolver(updateNameSchema),
    mode: "onChange",
  });

  const updateName = useMutation(
    async (name: string) =>
      (
        await api.patch(
          "/user/me",
          { name },
          { headers: { Authorization: token! } }
        )
      ).data,
    {
      onSuccess: () => {
        // TODO: Make this cleaner than a refresh
        queryClient.refetchQueries(["me"]);
      },
    }
  );

  useEffect(() => {
    setValue("name", name);
  }, [name]);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        updateName.mutate(values.name);
      })}
    >
      <Input
        label="Name"
        placeholder="Lea Gray"
        underlined
        contentRightStyling={!formState.isValid}
        status={formState.errors.name ? "error" : undefined}
        helperColor="error"
        helperText={formState.errors.name?.message}
        contentRight={
          watch("name") === name ? (
            <></>
          ) : updateName.isLoading ? (
            <Loading size="xs" />
          ) : formState.isValid ? (
            <ClearButton
              type="submit"
              css={{
                background: "transparent",
                border: "none",
                padding: 0,
                margin: 0,
                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faSave} />
            </ClearButton>
          ) : (
            <></>
          )
        }
        disabled={updateName.isLoading}
        css={{ width: "100%" }}
        {...register("name")}
      />
    </form>
  );
};

const updateEmailSchema = z.object({
  email: z
    .string()
    .email("Email must be a valid email address")
    .min(5)
    .min(1, "Email must be at least 5 characters")
    .max(256)
    .max(256, "Email must be at most 256 characters"),
});

const UpdateEmail: FC<{ email: string }> = ({ email }) => {
  const { token } = Auth.useContainer();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState, setValue, watch, setError } =
    useForm<{
      email: string;
    }>({
      resolver: zodResolver(updateEmailSchema),
      mode: "onTouched",
    });

  const updateEmail = useMutation(
    async (email: string) =>
      (
        await api.patch(
          "/user/me",
          { email },
          { headers: { Authorization: token! } }
        )
      ).data,
    {
      onSuccess: () => {
        // TODO: Make this cleaner than a refresh
        queryClient.refetchQueries(["me"]);
      },
    }
  );

  useEffect(() => {
    setValue("email", email);
  }, [email]);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          await updateEmail.mutateAsync(values.email);
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
      <Input
        label="Email"
        placeholder="lea@fyralabs.com"
        underlined
        status={formState.errors.email ? "error" : undefined}
        helperColor="error"
        helperText={formState.errors.email?.message}
        contentRightStyling={!formState.isValid}
        contentRight={
          watch("email") === email ? (
            <></>
          ) : updateEmail.isLoading ? (
            <Loading size="xs" />
          ) : formState.isValid ? (
            <ClearButton
              type="submit"
              css={{
                background: "transparent",
                border: "none",
                padding: 0,
                margin: 0,
                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faSave} />
            </ClearButton>
          ) : (
            <></>
          )
        }
        disabled={updateEmail.isLoading}
        css={{ width: "100%" }}
        {...register("email")}
      />
    </form>
  );
};

const BasicInfo = () => {
  const { token } = Auth.useContainer();
  const user = useQuery(
    ["me"],
    async () =>
      (
        await api.get<{
          id: string;
          email: string;
          name: string;
          emailVerified: boolean;
        }>("/user/me", {
          headers: {
            Authorization: token!,
          },
        })
      ).data,
    {
      enabled: !!token,
    }
  );

  const updatePasswordModal = useModal();

  const queryClient = useQueryClient();
  const verifyEmail = useMutation(
    async () =>
      (
        await api.post(
          "/user/me/requestVerificationEmail",
          {},
          { headers: { Authorization: token! } }
        )
      ).data,
    {
      onSuccess: () => {
        // TODO: Make this cleaner than a refresh
        queryClient.refetchQueries(["me"]);
      },
    }
  );

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
        {...updatePasswordModal.bindings}
      >
        <UpdatePassword
          closeModal={() => updatePasswordModal.setVisible(false)}
        />
      </Modal>
      <Card>
        <Text size={20} weight="bold">
          Basic Info
        </Text>
        <Spacer y={0.5} />
        <UpdateName name={user.data!.name} />
        <Spacer y={1} />
        <UpdateEmail email={user.data!.email} />
        <Spacer y={0.25} />
        {!user.data?.emailVerified ? (
          <VerifyRow
            css={{ display: "flex", alignItems: "center", gap: "5px" }}
          >
            {verifyEmail.isSuccess ? (
              <Text small color="success">
                Sent verification email, check your inbox!
              </Text>
            ) : verifyEmail.isError ? (
              <Text small color="error">
                Unable to send verification email
              </Text>
            ) : verifyEmail.isLoading ? (
              <Text small color="primary">
                Not verified. Verify now?
              </Text>
            ) : (
              <Link
                onClick={() => {
                  if (verifyEmail.isIdle) verifyEmail.mutate();
                }}
                css={{ display: "flex", alignItems: "center" }}
              >
                <Text small color="primary">
                  Not verified. Verify now?
                </Text>
              </Link>
            )}
            {verifyEmail.isLoading ? (
              <Loading size="md" type="points-opacity" />
            ) : (
              <></>
            )}
          </VerifyRow>
        ) : (
          <></>
        )}
        <Spacer y={1} />
        <Button
          color="warning"
          flat
          onClick={() => updatePasswordModal.setVisible(true)}
        >
          Update Password
        </Button>
        <Spacer y={0.5} />
      </Card>
    </>
  );
};

type DeviceType = "desktop" | "mobile" | "tablet";

const SessionRow: FC<{
  id: string;
  ip: string;
  lastUsedAt: Dayjs;
  createdAt: Dayjs;
  userAgent: string;
  country?: string;
  city?: string;
  subdivision?: string;
  device?: DeviceType;
  osName?: string;
  osVersion?: string;
  uaName?: string;
  uaVersion?: string;
}> = ({
  id,
  ip,
  lastUsedAt,
  createdAt,
  userAgent,
  country,
  city,
  subdivision,
  device,
  osName,
  osVersion,
  uaName,
  uaVersion,
}) => {
  const { token, sessionID, setToken } = Auth.useContainer();
  const queryClient = useQueryClient();
  const router = useRouter();
  const revokeSession = useMutation(
    async () =>
      (
        await api.delete("/user/me/session/" + id, {
          headers: {
            Authorization: token!,
          },
        })
      ).data,
    {
      onSuccess: () => {
        if (id === sessionID) {
          queryClient.clear();
          setToken(null);
          return router.replace("/login");
        }

        // TODO: Make this cleaner than a refresh
        queryClient.refetchQueries(["me", "session"]);
      },
    }
  );

  return (
    <Collapse
      contentLeft={
        <FontAwesomeIcon
          icon={
            device === "desktop"
              ? faDesktopAlt
              : device === "mobile"
              ? faMobileAlt
              : faTabletAlt
          }
          fixedWidth
          fontSize={20}
        />
      }
      title={
        <Text weight="bold">
          {(uaName ?? "Unknown") +
            (uaVersion ? " " + uaVersion : "") +
            " on " +
            (osName ?? "Unknown") +
            (osVersion ? " " + osVersion : "")}
          {id === sessionID ? (
            <>
              {" • "}
              <Text color="success" span>
                This Device
              </Text>
            </>
          ) : (
            <></>
          )}
        </Text>
      }
      subtitle={
        (city ?? "Unknown") +
        ", " +
        (subdivision ? subdivision + ", " : "") +
        (country ?? "Unknown")
      }
    >
      <Row>
        <Col>
          <Text weight="bold">IP</Text>
          <Text>{ip}</Text>
        </Col>
        <Col>
          <Text weight="bold">Last Used</Text>
          <Text>{lastUsedAt.calendar()}</Text>
        </Col>
      </Row>
      <Spacer y={1} />
      <Row>
        <Col>
          <Text weight="bold">Created</Text>
          <Text>{createdAt.calendar()}</Text>
        </Col>
        <Col>
          <Text weight="bold">User Agent</Text>
          <Tooltip content={userAgent}>
            <Text
              css={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                maxWidth: "200px",
              }}
            >
              {userAgent}
            </Text>
          </Tooltip>
        </Col>
      </Row>

      <Spacer y={1} />

      <Button
        color="error"
        css={{ w: "100%" }}
        auto
        disabled={revokeSession.isLoading}
        onClick={() => revokeSession.mutate()}
      >
        {revokeSession.isLoading ? (
          <Loading color="white" size="sm" />
        ) : id === sessionID ? (
          "Log Out"
        ) : (
          "Revoke Session"
        )}
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
            country?: string;
            city?: string;
            subdivision?: string;
            device?: DeviceType;
            osName?: string;
            osVersion?: string;
            uaName?: string;
            uaVersion?: string;
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
        createdAt: dayjs(session.createdAt),
        lastUsedAt: dayjs(session.lastUsedAt),
      })),
    [sessions]
  );

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
        {sessionData?.map((session) => (
          <SessionRow
            key={session.id}
            {...session}
            ip={session.ip}
            lastUsedAt={session.lastUsedAt}
            createdAt={session.createdAt}
            userAgent={session.userAgent}
          />
        ))}
      </Collapse.Group>
    </Card>
  );
};

const LogOut = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { sessionID, token, setToken } = Auth.useContainer();

  const revokeSession = useMutation(
    async () =>
      (
        await api.delete("/user/me/session/" + sessionID, {
          headers: {
            Authorization: token!,
          },
        })
      ).data,
    {
      onSuccess: () => {
        queryClient.clear();
        setToken(null);
        return router.replace("/login");
      },
    }
  );

  return (
    <Button
      color="error"
      css={{ w: "100%" }}
      auto
      disabled={revokeSession.isLoading}
      onClick={() => revokeSession.mutate()}
    >
      {revokeSession.isLoading ? (
        <Loading color="white" size="sm" />
      ) : (
        "Log Out"
      )}
    </Button>
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
        await api.get<{
          id: string;
          email: string;
          name: string;
          emailVerified: boolean;
        }>("/user/me", {
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
        <Text h1 css={{ textAlign: "center" }}>
          Welcome Back, {user.data?.name}
        </Text>
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

      <LogOut />
    </Container>
  );
};

//TODO: Find a better way of preventing SSR and client mismatch
export default dynamic(async () => Main);
