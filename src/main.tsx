import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const theme = localStorage.getItem("srl.theme");
if (theme) document.documentElement.dataset.theme = theme;

createRoot(document.getElementById("root")!).render(<App />);
