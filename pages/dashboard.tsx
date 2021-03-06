import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDesktopAlt,
  faMobileAlt,
  faSave,
  faTabletAlt,
  faWarning,
  faClock,
  faCopy,
  faCamera,
  faFileUpload,
  faTrash,
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
  Image,
  Loading,
  Link,
  Popover,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { Auth, useMe } from "../util/auth";
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { api } from "../util/api";
import dayjs, { Dayjs } from "dayjs";
import calendarPlugin from "dayjs/plugin/calendar";
import axios from "axios";
import { useIsClient } from "usehooks-ts";
import Head from "next/head";
import { TOTP } from "otpauth";
import qrcode from "qrcode";
import { CodeInput } from "../components/CodeInput";
import { Error } from "../components/Error";
import { Icon } from "../components/Icon";

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
          placeholder="????????????????????????"
          status={formState.errors.currentPassword ? "error" : undefined}
          bordered
          helperText={formState.errors.currentPassword?.message}
          helperColor="error"
          {...register("currentPassword")}
        />
        <Input.Password
          label={"New Password"}
          placeholder="????????????????????????"
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

const Header = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  mt: 25,
});
const ClearButton = styled("button", {
  background: "transparent",
  border: "none",
  padding: 0,
  margin: 0,
  cursor: "pointer",
});
const VerifyRow = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "5px",
});

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
  }, [name, setValue]);

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
            <ClearButton type="submit">
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
  }, [email, setValue]);

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
            <ClearButton type="submit">
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
      <Error>
        <Icon icon={faWarning} fontSize={30} css={{ color: "$error" }} />
        <Text>Failed to load basic user data, check console for more info</Text>
      </Error>
    );

  if (!user.data) return <></>;

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
      <Card css={{ px: 20, py: 12 }}>
        <Text size={20} weight="bold">
          Basic Info
        </Text>
        <Spacer y={0.5} />
        <UpdateName name={user.data!.name} />
        <Spacer y={1} />
        <UpdateEmail email={user.data!.email} />
        <Spacer y={0.25} />
        {!user.data?.emailVerified ? (
          <VerifyRow>
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
          color="primary"
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
              {" ??? "}
              <Text color="primary" span>
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
      <Error>
        <Icon icon={faWarning} fontSize={30} css={{ color: "$error" }} />
        <Text>Failed to load session data, check console for more info</Text>
      </Error>
    );

  return (
    <Card css={{ px: 20, py: 12 }}>
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
        router.replace("/login");
        setToken(null);
        queryClient.clear();
      },
    }
  );

  return (
    <Button
      color="secondary"
      css={{ w: "100%", mb: 25 }}
      auto
      disabled={revokeSession.isLoading}
      onClick={() => revokeSession.mutate()}
      flat
    >
      {revokeSession.isLoading ? (
        <Loading color="white" size="sm" />
      ) : (
        "Log Out"
      )}
    </Button>
  );
};

type AddTwoFactorMethod = null | "app" | "hardware" | "signal";

const SelectMethod: FC<{
  setMethod: Dispatch<SetStateAction<AddTwoFactorMethod>>;
}> = ({ setMethod }) => {
  return (
    <>
      <Modal.Header>
        <Text size={18} weight="bold">
          Add 2FA Method
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Button
          icon={<FontAwesomeIcon icon={faClock} />}
          onClick={() => setMethod("app")}
        >
          Authenticator App
        </Button>
        {/* <Button
          icon={<FontAwesomeIcon icon={faKey} />}
          onClick={() => setMethod("hardware")}
        >
          Hardware Device
        </Button>
        <Button
          icon={<FontAwesomeIcon icon={faCommentDots} />}
          onClick={() => setMethod("signal")}
        >
          Signal Message
        </Button> */}
      </Modal.Body>

      <Modal.Footer></Modal.Footer>
    </>
  );
};

const appMethodFirstStepSchema = z.object({
  name: z
    .string()
    .nonempty("Device name must not be empty")
    .max(256, "Device name must be less than 256 characters"),
});

const ConfirmAppMethod: FC<{
  name: string;
  secret: string;
  closeModal: () => void;
}> = ({ name, secret, closeModal }) => {
  const { token } = Auth.useContainer();
  const queryClient = useQueryClient();
  const confirmMethod = useMutation(
    async ({ secret, code }: { secret: string; code: string }) =>
      (
        await api.post(
          "/user/me/2fa",
          {
            method: "totp",
            name,
            data: {
              code,
              secret,
            },
          },
          {
            headers: {
              Authorization: token!,
            },
          }
        )
      ).data,
    {
      onSuccess: () => {
        queryClient.refetchQueries(["me", "2fa"]);
      },
    }
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
          await confirmMethod.mutateAsync({
            code,
            secret,
          });
          closeModal();
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

const AppMethod: FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const me = useMe();
  const totp = useMemo(
    () =>
      new TOTP({
        issuer: "FyraLabs",
        label: me.data?.email,
      }),
    [me.data?.name]
  );

  const [qrCode, setQrCode] = useState<string | null>(null);
  const { register, formState, handleSubmit, getValues } = useForm<{
    name: string;
  }>({
    resolver: zodResolver(appMethodFirstStepSchema),
    mode: "onTouched",
  });

  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    qrcode.toDataURL(totp.toString()).then(setQrCode);
  }, [totp.toString()]);

  return confirming ? (
    <>
      <Modal.Header>
        <Text size={18} weight="bold">
          Confirm 2FA Method
        </Text>
      </Modal.Header>
      <Modal.Body>
        <ConfirmAppMethod
          name={getValues("name")}
          secret={totp.secret.base32}
          closeModal={closeModal}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button auto onClick={() => setConfirming(false)} flat>
          Back
        </Button>
      </Modal.Footer>
    </>
  ) : (
    <form onSubmit={handleSubmit(() => setConfirming(true))}>
      <Modal.Header>
        <Text size={18} weight="bold">
          Add Authenticator App
        </Text>
      </Modal.Header>
      <Modal.Body>
        {qrCode ? <Image src={qrCode} /> : <Loading />}
        <Input
          value={totp.secret.base32}
          readOnly
          label="TOTP Secret"
          bordered
          contentRight={
            <Icon
              icon={faCopy}
              color="#FFFFFF"
              css={{ cursor: "pointer", pointerEvents: "all" }}
              onClick={() => {
                navigator.clipboard.writeText(totp.secret.base32);
              }}
            />
          }
        />

        <Input
          label="Device Name"
          bordered
          placeholder="Lea's iPhone"
          status={formState.errors.name ? "error" : undefined}
          helperText={formState.errors.name?.message}
          helperColor="error"
          {...register("name")}
        />
        <Spacer y={0.1} />
      </Modal.Body>

      <Modal.Footer>
        <Button auto type="submit">
          Continue
        </Button>
      </Modal.Footer>
    </form>
  );
};

interface TwoFactorMethod {
  id: string;
  name: string;
  type: "totp";
  createdAt: string;
  lastUsedAt?: string;
}

const TwoFactorItem: FC<{ method: TwoFactorMethod }> = ({ method }) => {
  const { token } = Auth.useContainer();
  const queryClient = useQueryClient();
  const deleteMethod = useMutation(
    async () =>
      (
        await api.delete("/user/me/2fa/" + method.id, {
          headers: {
            Authorization: token!,
          },
        })
      ).data,
    {
      onSuccess: () => {
        // TODO: Make this cleaner than a refresh
        queryClient.refetchQueries(["me", "2fa"]);
      },
    }
  );

  return (
    <Collapse
      contentLeft={<FontAwesomeIcon icon={faClock} fixedWidth fontSize={20} />}
      title={<Text weight="bold">{method.name}</Text>}
      subtitle={
        method.lastUsedAt ? dayjs(method.lastUsedAt).calendar() : "Never Used"
      }
    >
      <Row>
        <Col>
          <Text weight="bold">Created At</Text>
          <Text>{dayjs(method.createdAt).calendar()}</Text>
        </Col>
        <Col>
          <Text weight="bold">Type</Text>
          <Text>{method.type === "totp" ? "Authenticator App" : ""}</Text>
        </Col>
      </Row>

      <Spacer y={1} />

      <Button
        color="error"
        css={{ w: "100%" }}
        auto
        disabled={deleteMethod.isLoading}
        onClick={() => deleteMethod.mutate()}
      >
        {deleteMethod.isLoading ? (
          <Loading color="white" size="sm" />
        ) : (
          "Remove 2FA Method"
        )}
      </Button>
    </Collapse>
  );
};

const TwoFactor = () => {
  const addMethod = useModal(false);
  const [method, setMethod] = useState<AddTwoFactorMethod>(null);
  const { token } = Auth.useContainer();
  const methods = useQuery(
    ["me", "2fa"],
    async () =>
      (
        await api.get<TwoFactorMethod[]>("/user/me/2fa", {
          headers: {
            Authorization: token!,
          },
        })
      ).data,
    { enabled: !!token }
  );

  if (methods.isLoading) return <Loading>Loading 2FA Methods...</Loading>;
  if (methods.isError)
    return (
      <Error>
        <Icon icon={faWarning} fontSize={30} css={{ color: "$error" }} />
        <Text>Failed to load 2fa methods, check console for more info</Text>
      </Error>
    );

  return (
    <>
      <Modal
        aria-labelledby="Update Password"
        aria-describedby="Update your password"
        closeButton
        blur
        {...addMethod.bindings}
      >
        {method === null ? (
          <SelectMethod setMethod={setMethod} />
        ) : method === "app" ? (
          <AppMethod closeModal={() => addMethod.setVisible(false)} />
        ) : (
          <Text>Not implemented</Text>
        )}
      </Modal>
      <Card css={{ px: 20, py: 12 }}>
        <Text size={20} weight="bold">
          2FA
        </Text>
        <Spacer y={0.5} />
        <Collapse.Group css={{ p: 0 }}>
          {methods.data?.map((method) => (
            <TwoFactorItem key={method.id} method={method} />
          ))}
        </Collapse.Group>
        <Spacer y={0.5} />
        <Button
          color="primary"
          flat
          onClick={() => {
            setMethod(null);
            addMethod.setVisible(true);
          }}
        >
          Add 2FA Method
        </Button>
        <Spacer y={0.5} />
      </Card>
    </>
  );
};

const Avatar = styled("div", {
  position: "relative",
});

const UserAvatar = () => {
  const me = useMe();
  const avatarModal = useModal();
  const auth = Auth.useContainer();
  const queryClient = useQueryClient();
  const resetAvatar = useMutation(
    () =>
      api.delete("/user/me/avatar", {
        headers: {
          Authorization: auth.token!,
        },
      }),
    {
      onSuccess: () => {
        // TODO: Make this cleaner than a refresh
        queryClient.refetchQueries(["me"]);
      },
    }
  );
  const uploadAvatar = useMutation(
    (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);

      return api.put("/user/me/avatar", formData, {
        headers: {
          Authorization: auth.token!,
        },
      });
    },
    {
      onSuccess: () => {
        // TODO: Make this cleaner than a refresh
        queryClient.refetchQueries(["me"]);
      },
    }
  );
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        type="file"
        id="file"
        ref={inputRef}
        style={{ display: "none" }}
        accept="image/png, image/jpeg, image/webp"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          await uploadAvatar.mutateAsync(file);
          avatarModal.setVisible(false);
        }}
      />
      <Modal {...avatarModal.bindings} closeButton blur>
        <Modal.Header>
          <Text size={18} weight="bold">
            Update Avatar
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Button
            disabled={resetAvatar.isLoading || uploadAvatar.isLoading}
            icon={<FontAwesomeIcon icon={faFileUpload} />}
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            {uploadAvatar.isLoading ? <Loading size="xs" /> : "Upload Avatar"}
          </Button>
          {me.data?.avatarURL ? (
            <Button
              color="error"
              disabled={resetAvatar.isLoading || uploadAvatar.isLoading}
              icon={<FontAwesomeIcon icon={faTrash} />}
              onClick={async () => {
                await resetAvatar.mutateAsync();
                avatarModal.setVisible(false);
              }}
            >
              {resetAvatar.isLoading ? <Loading size="xs" /> : "Reset Avatar"}
            </Button>
          ) : (
            <></>
          )}
        </Modal.Body>
        <Modal.Footer />
      </Modal>
      <Avatar>
        <Image
          src={
            me.data?.avatarURL ??
            `https://hashvatar.fyralabs.com/${me.data!.id}/stagger`
          }
          objectFit="cover"
          css={{ borderRadius: "50%" }}
          containerCss={{ borderRadius: "50%" }}
          alt={me.data?.name + "'s avatar"}
          showSkeleton
          width={125}
          height={125}
        />
        <Button
          color="primary"
          css={{
            position: "absolute",
            right: 5,
            bottom: 5,
            width: 25,
            height: 25,
            p: 7,
            borderRadius: "50%",
          }}
          auto
          onClick={() => avatarModal.setVisible(true)}
        >
          <Icon
            icon={faCamera}
            css={{ position: "absolute", color: "$white" }}
          />
        </Button>
      </Avatar>
    </>
  );
};

const Main = () => {
  const router = useRouter();
  const { token } = Auth.useContainer();
  const me = useMe();

  useLayoutEffect(() => {
    if (!token) router.push("/login");
  }, [router, token]);

  if (me.isLoading)
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

  if (me.isError)
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
        <Error>
          <Icon icon={faWarning} fontSize={30} css={{ color: "$error" }} />
          <Text>Failed to load user data, check console for more info</Text>
        </Error>
      </Container>
    );

  if (!token) return <></>;

  return (
    <Container
      css={{ mw: 600, display: "flex", flexDirection: "column", gap: 25 }}
    >
      <Head>
        <title>Dashboard</title>
      </Head>
      <Header>
        <UserAvatar />
        <Text h1 css={{ textAlign: "center" }} size="2.25rem">
          Welcome Back, {me.data?.name}
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
      <TwoFactor />

      <LogOut />
    </Container>
  );
};

const Wrapper = () => {
  const isClient = useIsClient();

  return isClient ? <Main /> : <></>;
};

export default Wrapper;
