import { constantUsersPerSec, scenario, simulation } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";

export default simulation((setUp) => {
  const httpProtocol = http
    .baseUrl("https://api-ecomm.gatling.io")
    .acceptHeader("application/json");

  const scn = scenario("JS Browse")
    .exec(http("GET session").get("/session").check(status().is(200)))
    .pause(1)
    .exec(http("GET catalog").get("/catalog").check(status().in(200, 304)));

  const usersPerSec = 2;
  const durationSeconds = 60;

  setUp(
    scn.injectOpen(constantUsersPerSec(usersPerSec).during(durationSeconds)),
  ).protocols(httpProtocol);
});
