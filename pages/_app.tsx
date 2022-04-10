import { AppProps } from "next/app";
import "../styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { createTheme } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Auth } from "../util/auth";

const darkTheme = createTheme({
  type: "dark",
});

const queryClient = new QueryClient();

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <Auth.Provider>
      {/* @ts-ignore */}
      <QueryClientProvider client={queryClient}>
        <NextUIProvider theme={darkTheme}>
          <Component {...pageProps} />
        </NextUIProvider>
      </QueryClientProvider>
    </Auth.Provider>
  );
};

export default MyApp;
