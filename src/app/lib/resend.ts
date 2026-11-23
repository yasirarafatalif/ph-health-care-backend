import { Resend } from "resend";
import config from "../config";

const resend = new Resend(config.resend_api_key);

export default resend;