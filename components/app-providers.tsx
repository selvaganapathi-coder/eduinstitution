"use client";

import type { ReactNode } from "react";
import { App, ConfigProvider } from "antd";

const theme = {
  token: {
    colorPrimary: "#188038",
    colorInfo: "#1A73E8",
    colorSuccess: "#188038",
    colorWarning: "#F9AB00",
    colorError: "#D93025",
    colorBgLayout: "#F8FAFD",
    colorBgContainer: "#FFFFFF",
    colorText: "#202124",
    colorTextSecondary: "#5F6368",
    colorBorder: "#DADCE0",
    colorBorderSecondary: "#EEF0F1",
    borderRadius: 10,
    controlHeight: 42,
    fontFamily: "var(--font-geist), ui-sans-serif, system-ui, sans-serif",
  },
  components: {
    Layout: {
      bodyBg: "#F8FAFD",
      headerBg: "#FFFFFF",
      siderBg: "#FFFFFF",
    },
    Menu: {
      itemBg: "#FFFFFF",
      itemColor: "#202124",
      itemHoverBg: "#F8F9FA",
      itemSelectedBg: "#E6F4EA",
      itemSelectedColor: "#137333",
      itemActiveBg: "#E6F4EA",
    },
    Button: {
      primaryShadow: "none",
      defaultShadow: "none",
    },
    Card: {
      headerBg: "#FFFFFF",
    },
    Alert: {
      withDescriptionIconSize: 18,
    },
  },
};

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={theme}>
      <App message={{ top: 76, duration: 4 }} notification={{ placement: "topRight", top: 76 }}>
        {children}
      </App>
    </ConfigProvider>
  );
}
