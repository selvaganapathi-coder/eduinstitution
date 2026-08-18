"use client";

import type { ReactNode } from "react";
import { App, ConfigProvider } from "antd";

const theme = {
  token: {
    colorPrimary: "#076653",
    colorInfo: "#076653",
    colorSuccess: "#076653",
    colorWarning: "#E3EF26",
    colorBgLayout: "#FFFDEE",
    colorBgContainer: "#FFFFFF",
    colorText: "#06231D",
    colorTextSecondary: "#52635E",
    colorBorder: "#DDE8E3",
    borderRadius: 10,
    controlHeight: 42,
    fontFamily: "var(--font-geist), ui-sans-serif, system-ui, sans-serif",
  },
  components: {
    Layout: {
      bodyBg: "#FFFDEE",
      headerBg: "#FFFFFF",
      siderBg: "#06231D",
    },
    Menu: {
      darkItemBg: "#06231D",
      darkSubMenuItemBg: "#0C342C",
      darkItemColor: "#D7E7E1",
      darkItemHoverColor: "#FFFFFF",
      darkItemSelectedColor: "#06231D",
      darkItemSelectedBg: "#E3EF26",
    },
    Button: {
      primaryShadow: "none",
    },
  },
};

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={theme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
