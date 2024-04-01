import Alpine from "alpinejs";

window.Alpine = Alpine;

function split_time(time) {
  return [
    time >= 0 ? "" : "~",
    Math.floor(Math.abs(time) / 3600)
      .toString()
      .padStart(2, "0"),
    Math.floor((Math.abs(time) % 3600) / 60)
      .toString()
      .padStart(2, "0"),
    Math.floor(Math.abs(time) % 60)
      .toString()
      .padStart(2, "0"),
  ];
}

function set_title(state, time, fraction) {
  if (state === "Paused") {
    const [sym, h, m, s] = split_time(time);
    document.title = `TTM [W ${sym}${h}:${m}:${s}]`;
    return;
  }
  const other = state == "Working" ? "R " : "";
  const [sym, h, m, s] = split_time(time * fraction);
  document.title = `${state[0]} [${other}${sym}${h}:${m}:${s}]`;
}

Alpine.data("timer", () => ({
  state: "Paused", // "Working", "Resting", "Paused"
  fraction: 1 / 3,
  time: 0,
  timer: null,
  init() {
    this.$watch("state", () => set_title(this.state, this.time, this.fraction));
    this.$watch("time", () => set_title(this.state, this.time, this.fraction));
  },
  start(val, time) {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.time += val;
    }, time);
  },
  from() {
    switch (this.state) {
      case "Paused": {
        return this.to("Working");
      }
      case "Working": {
        clearInterval(this.timer);
        this.timer = null;
        return this.to("Resting");
      }
      case "Resting": {
        clearInterval(this.timer);
        this.timer = null;
        return this.to("Paused");
      }
    }
  },
  to(state) {
    this.state = state;
    switch (state) {
      case "Paused": {
        return;
      }
      case "Working": {
        this.start(1, 1000);
        return;
      }
      case "Resting": {
        this.start(-1, 1000 * this.fraction);
        return;
      }
    }
  },
  toLabel(state) {
    switch (state) {
      case "Paused": {
        return "=P";
      }
      case "Working": {
        return "=|";
      }
      case "Resting": {
        return "=)";
      }
    }
  },
  split_time: split_time,
}));

Alpine.start();
