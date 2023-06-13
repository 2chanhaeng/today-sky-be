import Express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import api from "@/api";
import route from "@/routes";
import { removeLastSlash } from "@/utils/controller";

const app = Express();
const PORT = 8080;

app.use(removeLastSlash);
app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");
app.use(Express.static("views"));

app.use("/public", Express.static(__dirname + "/public"));
app.use("/image", Express.static(__dirname + "/upload"));
app.use("/image", Express.static(__dirname + "/image"));

// 정적 파일 제공
app.set("public", __dirname + "/public");

app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());

app.use("/api", api);
app.use("/", route);

app.get("*", (req, res) => {
  res.status(404).render("404");
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
