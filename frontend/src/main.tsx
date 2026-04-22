import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import { AuthProvider } from "./context/AuthContext.tsx";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
