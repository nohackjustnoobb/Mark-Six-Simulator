import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import Matter, { Composite, Composites } from "matter-js";

//generate root
document.body.innerHTML = '<div id="root"></div>';

//generate 1-49 image url
const image_url = Array(49)
  .fill(0)
  .map((value, index) => {
    var forno =
      index + 1 > 9 ? (index + 1).toString() : "0" + (index + 1).toString();
    return (
      "https://bet.hkjc.com/marksix/info/images/icon/no_" +
      forno +
      "_s.gif?CV=L3.08R1a"
    );
  });
//check phone user
const phone = $(document).width() <= 760;

//phsics engine
const { Engine, Render, World, Bodies, Body, Common } = Matter;
var engine, render;
function createWorld() {
  //phsics environment
  engine = Engine.create();
  render = Render.create({
    element: document.getElementById("world"),
    engine: engine,
    options: {
      width: 350,
      height: 600,
      wireframes: false,
      background: "transparent",
    },
  });
  Engine.run(engine);
  Render.run(render);

  //generate cicrle
  var cicrle_list = [];
  var sradius = 8;
  const center = [175, 200];
  const radius = 150;
  const border_color = "black";
  setTimeout(() => {
    var cicrle_func_x = (x) => {
      return [
        Math.sqrt(radius ** 2 - (x - center[0]) ** 2) + center[1],
        -Math.sqrt(radius ** 2 - (x - center[0]) ** 2) + center[1],
      ];
    };

    var cicrle_func_y = (y) => {
      return [
        Math.sqrt(radius ** 2 - (y - center[1]) ** 2) + center[0],
        -Math.sqrt(radius ** 2 - (y - center[1]) ** 2) + center[0],
      ];
    };

    for (var i = sradius; i <= 350; i += sradius / 2) {
      var y = cicrle_func_x(i);
      if (y[0]) {
        if (y[0] == y[1]) {
          cicrle_list.push(
            Bodies.circle(i, y[0], sradius, {
              isStatic: true,
              render: {
                fillStyle: border_color,
              },
            })
          );
        } else {
          cicrle_list.push(
            Bodies.circle(i, y[0], sradius, {
              isStatic: true,
              render: {
                fillStyle: border_color,
              },
            }),
            Bodies.circle(i, y[1], sradius, {
              isStatic: true,
              render: {
                fillStyle: border_color,
              },
            })
          );
        }
      }
    }

    for (var i = 0; i <= 600; i += sradius / 2) {
      var x = cicrle_func_y(i);
      if (x[0]) {
        if (x[0] == x[1]) {
          cicrle_list.push(
            Bodies.circle(x[0], i, sradius, {
              isStatic: true,
              render: {
                fillStyle: border_color,
              },
            })
          );
        } else {
          cicrle_list.push(
            Bodies.circle(x[0], i, sradius, {
              isStatic: true,
              render: {
                fillStyle: border_color,
              },
            }),
            Bodies.circle(x[1], i, sradius, {
              isStatic: true,
              render: {
                fillStyle: border_color,
              },
            })
          );
        }
      }
    }
    World.add(engine.world, cicrle_list);
  }, 700);
}

function start_simulation() {
  World.clear(engine.world, true);
  var counter = 0;
  var stack = Composites.stack(80, 110, 7, 7, 9, 1, (x, y) => {
    counter++;
    return Bodies.circle(x, y, 10.5, {
      label: "ball" + counter,
      render: {
        sprite: {
          texture: image_url[counter - 1],
        },
      },
    });
  });
  World.add(engine.world, [stack]);
  shake();
}

function shake() {
  var timeout = (timeout, obj) => {
    setTimeout(() => {
      Body.applyForce(obj, obj.position, {
        x:
          (Common.random(0, 1) * 10).toFixed(0) % 2 == 0
            ? Common.random(0.007, 0.009)
            : Common.random(-0.009, -0.007),
        y: Common.random(-0.009, -0.007),
      });
    }, timeout);
  };
  var objlist = Composite.allBodies(engine.world);
  var obj = objlist.slice(objlist.length - 49, objlist.length);
  for (var j = 0; j < 12; j++) {
    setTimeout(() => {
      for (var i in obj) {
        timeout(25 * i, obj[i]);
      }
    }, j * 400);
  }
}

class RHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = { itemsList: null, div: false, open: !phone };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        div: true,
      });
    }, 100);
    window.addEventListener("resize", () => this.forceUpdate());
    $.get("/contentserver/jcbw/cmc/last30draw.json").done((result) => {
      const imglist = result
        .map((value) => value.no.split("+"))
        .map((value) => {
          var urlList = [];
          value.forEach((val) => {
            urlList.push(
              <img key={val} src={image_url[Number(val) - 1]}></img>
            );
          });
          return <div>{urlList}</div>;
        });
      const itemsList = result.map((value, index) => (
        <li key={value.id}>
          {value.date}: {imglist[index]} <FontAwesomeIcon icon={faPlus} />
          <img src={image_url[Number(value.sno) - 1]}></img>
        </li>
      ));
      this.setState({
        itemsList: itemsList,
      });
    });
  }

  toggle_open() {
    this.setState({
      open: !this.state.open,
    });
  }

  render() {
    const maxHeight = this.state.open ? $(document).height() * 0.61 : 50;
    const div = this.state.div
      ? {
          maxHeight: maxHeight,
          opacity: 0.85,
          transform: "translate(0, -0)",
        }
      : {
          maxHeight: maxHeight,
        };
    const style_div = {
      borderBottom: "3px solid #10109e",
      transform: "translate(15px, -7px)",
      width: 90,
      overflow: "visible",
      margin: 5,
    };
    const style_h5 = {
      transform: "translate(-13px,5px)",
      width: 200,
    };
    const rotation = this.state.open ? 270 : 0;

    return (
      <div className="RHistory left" style={div}>
        <div style={style_div}>
          <h5 style={style_h5}>真實六合彩攪珠結果</h5>
        </div>
        <div onClick={() => this.toggle_open()}>
          <FontAwesomeIcon icon={faAngleLeft} rotation={rotation} />
        </div>
        <ul>{this.state.itemsList}</ul>
      </div>
    );
  }
}

class Intro extends React.Component {
  constructor(props) {
    super(props);
    this.state = { div: false, open: !phone };
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        div: true,
      });
    }, 100);
    window.addEventListener("resize", () => this.forceUpdate());
  }

  toggle_open() {
    this.setState({
      open: !this.state.open,
    });
  }

  render() {
    const height = this.state.open ? $(document).height() * 0.35 : 50;
    const div = this.state.div
      ? {
          height: height,
          opacity: 0.85,
          transform: "translate(0, -0)",
          overflowY: this.state.open ? "scroll" : "hidden",
        }
      : {
          height: height,
        };
    const style_div = {
      borderBottom: "3px solid #10109e",
      transform: "translate(15px, -7px)",
      width: 90,
      overflow: "visible",
      margin: 5,
    };
    const style_h5 = {
      transform: "translate(0px,5px)",
      width: 200,
    };
    const rotation = this.state.open ? 270 : 0;
    const style_p = { display: this.state.open ? "block" : "none" };

    return (
      <div className="Intro left" style={div}>
        <div style={style_div}>
          <h5 style={style_h5}>介紹和注意事項</h5>
        </div>
        <div onClick={() => this.toggle_open()}>
          <FontAwesomeIcon icon={faAngleLeft} rotation={rotation} />
        </div>
        <p style={style_p}>
          真實六合彩攪珠結果：
          <br />
          當中數據從
          <a
            href="https://bet.hkjc.com/marksix/Results.aspx?lang=ch"
            target="_blank"
          >
            賽馬會官網
          </a>
          所得。
          <br /> <br />
          模擬攪珠： <br />
          每個號碼的攪珠時間為5秒，而程式會將最底的號碼作為中獎號碼，一共6個號碼和1個特別號碼。
          <br />
          <br />
          完整程式碼：
          <br />
        </p>
      </div>
    );
  }
}

class Marksix extends React.Component {
  constructor(props) {
    super(props);
    this.state = { div: false, open: true };
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        div: true,
      });
    }, 100);
    window.addEventListener("resize", () => this.forceUpdate());
    createWorld();
  }

  toggle_open() {
    this.setState({
      open: !this.state.open,
    });
  }

  render() {
    const height = this.state.open
      ? phone
        ? $(document).height() * 0.96 + 100
        : $(document).height() * 0.96 + 10
      : 60;
    const div = this.state.div
      ? {
          height: height,
          opacity: 0.85,
          transform: "translate(0, -0)",
        }
      : {
          height: height,
        };
    const style_div = {
      position: "relative",
      left: "50%",
      padding: 0,
      borderBottom: "3px solid #10109e",
      transform: "translate(-50%, -7px)",
      width: 180,
      overflow: "visible",
      margin: 5,
    };
    const style_h5 = {
      transform: "translate(0,5px)",
      width: 180,
      textAlign: "center",
      fontSize: 30,
    };
    const rotation = this.state.open ? 270 : 0;

    return (
      <div className="Marksix center" style={div}>
        <div style={style_div}>
          <h5 style={style_h5}>模擬攪珠</h5>
        </div>
        <div onClick={() => this.toggle_open()}>
          <FontAwesomeIcon icon={faAngleLeft} rotation={rotation} />
        </div>
        <div id="world"></div>
        <button id="start_rolling" onClick={start_simulation}>
          開始攪珠
        </button>
      </div>
    );
  }
}

class Bet extends React.Component {
  constructor(props) {
    super(props);
    this.state = { div: false, open: !phone };
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        div: true,
      });
    }, 100);
    window.addEventListener("resize", () => this.forceUpdate());
  }

  toggle_open() {
    this.setState({
      open: !this.state.open,
    });
  }

  render() {
    const height = this.state.open ? $(document).height() * 0.48 : 50;
    const div = this.state.div
      ? {
          height: height,
          opacity: 0.85,
          transform: "translate(0, -0)",
        }
      : {
          height: height,
        };
    const style_div = {
      borderBottom: "3px solid #10109e",
      transform: "translate(15px, -7px)",
      width: 90,
      overflow: "visible",
      margin: 5,
    };
    const style_h5 = {
      transform: "translate(0px,5px)",
      width: 200,
    };
    const rotation = this.state.open ? 270 : 0;

    return (
      <div className="Bet right" style={div}>
        <div style={style_div}>
          <h5 style={style_h5}>模擬下注</h5>
        </div>
        <div onClick={() => this.toggle_open()}>
          <FontAwesomeIcon icon={faAngleLeft} rotation={rotation} />
        </div>
      </div>
    );
  }
}

class VHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = { div: false, open: !phone };
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        div: true,
      });
    }, 100);
    window.addEventListener("resize", () => this.forceUpdate());
  }

  toggle_open() {
    this.setState({
      open: !this.state.open,
    });
  }

  render() {
    const height = this.state.open ? $(document).height() * 0.48 : 50;
    const div = this.state.div
      ? {
          height: height,
          opacity: 0.85,
          transform: "translate(0, -0)",
        }
      : {
          height: height,
        };
    const style_div = {
      borderBottom: "3px solid #10109e",
      transform: "translate(15px, -7px)",
      width: 90,
      overflow: "visible",
      margin: 5,
    };
    const style_h5 = {
      transform: "translate(0px,5px)",
      width: 200,
    };
    const rotation = this.state.open ? 270 : 0;

    return (
      <div className="Bet right" style={div}>
        <div style={style_div}>
          <h5 style={style_h5}>模擬攪珠結果</h5>
        </div>
        <div onClick={() => this.toggle_open()}>
          <FontAwesomeIcon icon={faAngleLeft} rotation={rotation} />
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <div className="row">
    <div className="col-md-3">
      <RHistory />
      <Intro />
    </div>
    <div className="col-md-6">
      <Marksix />
    </div>
    <div className="col-md-3">
      <Bet />
      <VHistory />
    </div>
  </div>,
  document.getElementById("root")
);
