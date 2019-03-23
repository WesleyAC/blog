function sign(number) {
  return number?number<0?-1:1:0
}

function makeSimState(sim_num) {
  return {
    timestep: 0.05,

    running: false,

    goal: 5,

    elevator: {
      'x': 8,
      'xdot': 0,
      'xddot': 0,
      'ff': 10,
      'fg': 9.8,
      'mass': 100
    },

    convertCoords: function(x) {
      return ((10-x) * 12)+35;
    },

    updatePositions: function() {
      this.celevator.setTop(this.convertCoords(this.elevator.x) - (40/2));
      this.cgoal.set({'y1': this.convertCoords(this.goal)});
      this.cgoal.set({'y2': this.convertCoords(this.goal)});
      this.canvas.renderAll();
    },

    updateState: function() {
      this.elevator.xdot += this.elevator.xddot * this.timestep;
      this.elevator.x += this.elevator.xdot * this.timestep;
    },

    setForce: function(force){
      // a = F / m
      this.elevator.xddot = (force / this.elevator.mass) - (this.elevator.ff / this.elevator.mass * this.elevator.xdot) - this.elevator.fg;
    },

    updateAll: function() {
      if (this.running) {
        this.updateState();
        this.updatePositions();
      }
    },

    canvas: new fabric.StaticCanvas(document.getElementsByClassName('canvas-inner')[sim_num]),

    setup: function() {
      this.canvas.setWidth(200);
      this.canvas.setHeight(200);

      this.celevator = new fabric.Rect({
        left: 100 - 11,
        top: this.convertCoords(8) - (40/2),
        fill: 'grey',
        width: 22,
        height: 40
      });

      this.cgoal = new fabric.Line([0, this.convertCoords(this.goal), 300, this.convertCoords(this.goal)], {
        fill: 'green',
        stroke: 'green',
        strokeWidth: 1
      });

      this.ceiling = new fabric.Rect({
        left: 0,
        top: 0,
        width: 200,
        height: this.convertCoords(10) - this.celevator.height/2
      });

      this.floor = new fabric.Rect({
        left: 0,
        top: this.convertCoords(0) + this.celevator.height/2,
        width: 200,
        height: 100
      });

      this.canvas.add(this.celevator);
      this.canvas.add(this.cgoal);
      this.canvas.add(this.ceiling);
      this.canvas.add(this.floor);
    },

    globals: {},

    setGlobal: function(name, value) {
      this.globals[name] = value;
    },

    getGlobal: function(name) {
      if (name in this.globals) {
        return this.globals[name];
      } else {
        return 0;
      }
    },

    controlFunc: function(x, goal) {
      return 0;
    },

    runControlFunc: function() {
      force = this.controlFunc(this.elevator.x, this.goal);
      this.setForce((force < -1.0 ? -1.0 : (force > 1.0 ? 1.0 : force)) * 5000)
    },

    updateFunction: function() {
      this.reset();
      eval("this.controlFunc = " + document.getElementsByClassName("control-textarea")[sim_num].value);
      this.goal = document.getElementsByClassName("goal-input")[sim_num].value;
      this.running = true;
    },

    reset: function() {
      this.elevator = {
        'x': 8,
        'xdot': 0,
        'xddot': 0,
        'ff': 10,
        'fg': 9.8,
        'mass': 100
      };

      this.goal = 5;
    }
  }
}

var sims = [];

function makeSim(sim_id, defaulttext) {
  sims.push(makeSimState(sim_id));
  sims[sims.length-1].setup();
  document.getElementsByClassName("run-button")[sim_id].setAttribute("onclick", "javascript:sims[" + (sims.length - 1) +"].updateFunction()");
  document.getElementsByClassName("control-textarea")[sim_id].value = defaulttext;
  setInterval("sims[" + (sims.length - 1) + "].updateAll()", sims[sims.length-1].timestep * 1000);
  setInterval("sims[" + (sims.length - 1) + "].runControlFunc()", sims[sims.length-1].timestep * 1000);
}
