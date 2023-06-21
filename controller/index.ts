import { Request, Response } from "express";
import login from "./login";
import signup from "./signup";
import logout from "./logout";
import profile from "./profile";

declare module "express-session" {
  interface SessionData {
    user: number;
  }
}

//index page
async function index(req: Request, res: Response) {
  res.render("index");
}

export default {
  index,
  // login
  login: login.post,
  // logout
  logout: logout.get,
  // signup
  signup: signup.post,
  // profile
  profile: profile.get,
};
