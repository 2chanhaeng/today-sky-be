import Express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import api from "@/api";
import { removeLastSlash } from "@/utils/controller";

const app = Express();
const PORT = 8080;

app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());

app.use("/", api);
app.get("*", (req, res) => {
  res.status(404).send("404 Not Found");
});

app.use(removeLastSlash);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
