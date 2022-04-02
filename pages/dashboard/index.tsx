import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComputer,
  faFingerprint,
  faKey,
  faMobileAlt,
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
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

const BasicInfo = () => {
  const { setVisible, bindings } = useModal();

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
      <Card css={{ mt: 20, mw: 500 }}>
        <Text size={20} weight="bold">
          Basic Info
        </Text>
        <Spacer y={0.5} />
        <Input label="Name" placeholder="Lea Gray" underlined />
        <Spacer y={1} />
        <Input label="Email" placeholder="lea@fyralabs.com" underlined />
        <Spacer y={1} />
        <Button color="warning" flat onClick={() => setVisible(true)}>
          Update Password
        </Button>
        <Spacer y={0.5} />
      </Card>
    </>
  );
};

const Index = () => {
  return (
    <Container>
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

      {/* <Card css={{ mt: 20, mw: 500 }}>
        <Text size={20} weight="bold">
          Sessions
        </Text>
        <Collapse.Group css={{ p: 0 }}>
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

          <Collapse
            contentLeft={
              <FontAwesomeIcon icon={faComputer} fixedWidth fontSize={20} />
            }
            title={<Text weight="bold">Mac</Text>}
            subtitle="Saint Paul, MN"
          >
            <Row>
              <Col>
                <Text weight="bold">IP</Text>
                <Text>0.0.0.0</Text>
              </Col>
              <Col>
                <Text weight="bold">Last Used</Text>
                <Text>Today, at 12:21pm</Text>
              </Col>
            </Row>

            <Spacer y={1} />

            <Button color="error" css={{ w: "100%" }} auto>
              Revoke Session
            </Button>
          </Collapse>
        </Collapse.Group>
      </Card>
      <Card css={{ mt: 20, mw: 500 }}>
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
      </Card> */}
    </Container>
  );
};

export default Index;
