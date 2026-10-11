import {
  constantUsersPerSec,
  getEnvironmentVariable,
  jsonPath,
  scenario,
  simulation,
} from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { createGovukNotifyToken } from "./helpers/notifyAuth.js";

const apiKey = getEnvironmentVariable("NOTIFY_API_KEY", "");
if (!apiKey) {
  throw new Error("NOTIFY_API_KEY environment variable is required");
}
const baseUrl =
  getEnvironmentVariable("NOTIFY_BASE_URL", "") ||
  "http://notify-api.localhost:6011";

// Same key parsing as the GOV.UK Notify JS client: <name>-<serviceId>-<secret>
const secret = apiKey.substring(apiKey.length - 36);
const serviceId = apiKey.substring(apiKey.length - 73, apiKey.length - 37);

export default simulation((setUp) => {
  const httpProtocol = http.baseUrl(baseUrl).acceptHeader("application/json");

  const scn = scenario("Notify get templates").exec(
    http("GET templates")
      .get("/v2/templates")
      .header(
        "Authorization",
        () => `Bearer ${createGovukNotifyToken(secret, serviceId)}`,
      )
      .check(status().is(200))
      .check(jsonPath("$.templates").exists()),
  );

  const usersPerSec = 2;
  const durationSeconds = 60;

  setUp(
    scn.injectOpen(constantUsersPerSec(usersPerSec).during(durationSeconds)),
  ).protocols(httpProtocol);
});
