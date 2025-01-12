import { createMachine, createActor } from "xstate";
import readline from "readline";

const evChargingMachine = createMachine({
  id: "evChargingStation",
  initial: "Idle",
  states: {
    Idle: {
      on: {
        success: "Authorized",
        fail: {
          target: "AuthorizationFailed",
          reenter: true,
        },
        reset: "Idle",
      },
    },
    Authorized: {
      on: {
        start: "Starting",
        reset: "Idle",
      },
    },
    AuthorizationFailed: {
      on: {
        reset: "Idle",
      },
    },
    Starting: {
      on: {
        begin: "Charging",
        reset: "Idle",
      },
    },
    Charging: {
      on: {
        stop: "Stopped",
        reset: "Idle",
      },
    },
    Stopped: {
      on: {
        reset: "Idle",
      },
    },
  },
});

const authenticate = (evChargingActor) => {
  console.log("Authorizing...");
  setTimeout(() => {
    const result = Math.random() < 0.4 ? "success" : "fail";
    console.log(`Authorization result: ${result}`);
    evChargingActor.send({ type: result });
  }, 2000);
};

const evChargingActor = createActor(evChargingMachine);

evChargingActor.subscribe((state) => {
  console.log(`Entered ${state.value} state.`);
});

evChargingActor.start();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(`
EV Charging Station State Machine:

a: Press 'a' to authorize
f: Press 'f' to un-authorize
s: Press 's' to start charging
c: Press 'c' to begin charging
t: Press 't' to stop charging
r: Press 'r' to reset
`);

rl.on("line", (input) => {
  switch (input) {
    case "a":
      authenticate(evChargingActor);
      break;
    case "s":
      evChargingActor.send({ type: "start" });
      break;
    case "c":
      evChargingActor.send({ type: "begin" });
      break;
    case "t":
      evChargingActor.send({ type: "stop" });
      break;
    case "f":
      evChargingActor.send({ type: "fail" });
      break;
    case "r":
      evChargingActor.send({ type: "reset" });
      break;
    default:
      console.log("Invalid key pressed. Try again.");
  }
});
