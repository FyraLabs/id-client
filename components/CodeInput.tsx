import { FormElement, Input, Row, styled, Text } from "@nextui-org/react";
import { FC, useEffect, useRef, useState } from "react";

const BaseCodeInput: FC<{
  onCode: (code: string) => void;
  onChange: (code: string) => void;
  error?: string;
}> = ({ onCode, error, onChange }) => {
  const [code, setCode] = useState<
    [number?, number?, number?, number?, number?, number?]
  >([undefined, undefined, undefined, undefined, undefined, undefined]);

  useEffect(() => {
    onChange(code.join(""));
    if (code.filter((c) => c !== undefined).length === 6) {
      onCode(code.join(""));
    }
  }, [code]);

  const refs = [
    useRef<FormElement>(null),
    useRef<FormElement>(null),
    useRef<FormElement>(null),
    useRef<FormElement>(null),
    useRef<FormElement>(null),
    useRef<FormElement>(null),
  ];

  return (
    <>
      <Row css={{ display: "flex", gap: 15, justifyContent: "center" }} fluid>
        {code.map((val, i) => (
          <Input
            aria-label={"Code Digit Input " + (i + 1)}
            key={i}
            value={val ?? ""}
            ref={refs[i]}
            status={error ? "error" : undefined}
            onPaste={(e) => {
              e.preventDefault();
              const code = e.clipboardData.getData("text/plain");

              if (isNaN(parseInt(code))) return;

              code.split("").forEach((c, index) => {
                if (i + index < 6) {
                  setCode((code) => {
                    const newCode = [...code];
                    newCode[i + index] = parseInt(c);
                    return newCode as any;
                  });

                  if (code.length - 1 === index || i + index === 5) {
                    refs[i + index].current?.focus();
                  }
                }
              });
            }}
            onKeyDown={(event) => {
              if (event.ctrlKey || event.metaKey) {
                return false;
              }

              if (event.key === "Backspace") {
                if (i - 1 > -1 && val === undefined) {
                  setCode((code) => {
                    const newCode = [...code];
                    newCode[i - 1] = undefined;
                    return newCode as any;
                  });
                  refs[i - 1].current?.focus();
                  event.preventDefault();
                }
              }

              if (event.key === "ArrowRight" && i + 1 < 6) {
                refs[i + 1].current?.focus();
                event.preventDefault();
              }

              if (event.key === "ArrowLeft" && i - 1 > -1) {
                refs[i - 1].current?.focus();
                event.preventDefault();
              }
            }}
            onKeyPress={(event) => {
              if (event.ctrlKey || event.metaKey) {
                return false;
              }

              if (!/[0-9]/.test(event.key)) {
                return event.preventDefault();
              }

              if (val !== undefined && String(val).length !== 0) {
                if (i + 1 < 6) {
                  refs[i + 1].current?.focus();
                  setCode((code) => {
                    const newCode = [...code];
                    newCode[i + 1] = parseInt(event.key);
                    return newCode as any;
                  });
                }
                event.preventDefault();
              }
            }}
            onChange={(e) => {
              setCode((code) => {
                const ret = code.slice(0);
                if (e.target.value === "") {
                  ret[i] = undefined;
                } else {
                  ret[i] = parseInt(e.target.value);

                  if (i + 1 < 6) {
                    refs[i + 1].current?.focus();
                  } else {
                    refs[i].current?.blur();
                  }
                }

                return ret as any;
              });
            }}
            bordered={!error}
            size={"xl"}
            css={{
              input: {
                textAlign: "center",
                fontWeight: "$bold",
                fontSize: "$md",
                width: 25,
                padding: 0,
              },
            }}
          />
        ))}
      </Row>
      {error ? (
        <Text color="error" small>
          {error}
        </Text>
      ) : (
        <></>
      )}
    </>
  );
};

export const CodeInput = styled(BaseCodeInput);
