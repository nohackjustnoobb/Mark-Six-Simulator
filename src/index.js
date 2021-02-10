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

//global variable
var engine, render;
var roll_history = [];
var bet_list = [];

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
function createWorld() {
  //phsics environment
  engine = Engine.create();
  render = Render.create({
    element: document.getElementById("world"),
    engine: engine,
    options: {
      width: 350,
      height: 400,
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
  const border_color = "#2b2ba1";
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
      <div className="Intro left" style={div}>
        <div style={style_div}>
          <h5 style={style_h5}>介紹</h5>
        </div>
        <div onClick={() => this.toggle_open()}>
          <FontAwesomeIcon icon={faAngleLeft} rotation={rotation} />
        </div>
        <div
          style={{
            height: "90%",
            width: "100%",
            overflowY: "scroll",
          }}
        >
          <p>
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
            每個號碼的攪珠時間大約為2.5秒，而程式會將最底的號碼作為中獎號碼，一共6個號碼和1個特別號碼。
            <br />
            <br />
            完整程式碼：
            <br />
            <a
              href="https://github.com/nohackjustnoobb/Mark-Six-Simulator"
              target="_blank"
            >
              https://github.com/nohackjustnoobb/Mark-Six-Simulator
            </a>
          </p>
        </div>
      </div>
    );
  }
}

class Marksix extends React.Component {
  constructor(props) {
    super(props);
    this.state = { div: false, open: true, roll: [], click: true, award: null };
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        div: true,
      });
    }, 100);
    window.addEventListener("resize", () => this.forceUpdate());
    window.update_bet = () => this.forceUpdate();
    createWorld();
  }

  toggle_open() {
    this.setState({
      open: !this.state.open,
    });
  }

  start_roll() {
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
    this.setState({
      roll: [],
      click: false,
    });
    window.toggle_click();
    for (let _ = 0; _ < 7; _++) {
      setTimeout(() => {
        var roll = new Promise((resolve) => {
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
          var obj = objlist.slice(objlist.length - (49 - _), objlist.length);
          for (var j = 0; j < 6; j++) {
            setTimeout(() => {
              for (var i in obj) {
                timeout(10 * i, obj[i]);
              }
            }, j * 400);
          }
          setTimeout(() => {
            var max = 0;
            var max_obj;
            for (var i of obj) {
              if (i.position.y > max) {
                max = i.position.y;
                max_obj = i;
              }
            }
            resolve(max_obj);
          }, j * 400 + 700);
        });

        roll.then((value) => {
          var roll = this.state.roll;
          roll.push(Number(value.label.replace("ball", "")));
          World.remove(engine.world, value, true);
          this.setState({
            roll: roll,
          });
        });
      }, 4600 * _);
    }
    setTimeout(() => {
      this.setState({
        click: true,
      });
      roll_history.push(this.state.roll);
      window.toggle_click();
      this.check_bet();
      window.update();
    }, 32200);
  }

  quick_roll() {
    var roll = [];
    for (var i = 0; i < 7; i++) {
      var rand = Common.random(1, 49).toFixed(0);
      while (roll.indexOf(rand) != -1) {
        rand = Common.random(1, 49).toFixed(0);
      }
      roll.push(Number(rand));
    }
    roll_history.push(roll);
    this.setState({
      roll: roll,
    });
    window.update();
    this.check_bet();
  }

  check_bet() {
    if (bet_list) {
      var same = 0;
      var sno = false;
      var _ = roll_history[roll_history.length - 1];
      var award = null;
      for (var i in _) {
        if (bet_list.indexOf(_[i]) != -1) {
          if (i == 7) {
            sno = true;
          } else {
            same++;
          }
        }
      }
      switch (same) {
        case 3:
          if (sno) {
            award = "六";
            break;
          } else {
            award = "七";
            break;
          }
        case 4:
          if (sno) {
            award = "四";
            break;
          } else {
            award = "五";
            break;
          }
        case 5:
          if (sno) {
            award = "二";
            break;
          } else {
            award = "三";
            break;
          }
        case 6:
          award = "頭";
          break;
        default:
          award = null;
      }
    }
    bet_list = [];
    this.setState({
      award: award,
    });
  }

  render() {
    const height = this.state.open
      ? phone
        ? $(document).height() * 0.96 + 150
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
    const result_list = this.state.roll.map((value, index) => {
      if (index == 6) {
        return (
          <li>
            <FontAwesomeIcon icon={faPlus} />
            <img src={image_url[value - 1]}></img>
          </li>
        );
      }
      return (
        <li>
          <img src={image_url[value - 1]}></img>
        </li>
      );
    });
    const bet_ = bet_list.map((value) => {
      return <img src={image_url[value - 1]}></img>;
    });

    return (
      <div className="Marksix center" style={div}>
        <div style={style_div}>
          <h5 style={style_h5}>模擬攪珠</h5>
        </div>
        <div onClick={() => this.toggle_open()}>
          <FontAwesomeIcon icon={faAngleLeft} rotation={rotation} />
        </div>
        <div
          style={{
            height: "90%",
            width: "100%",
            overflowY: "scroll",
          }}
        >
          <div id="bet_div">
            <h6>下注或中獎顯示：</h6>
            <div id="bet_number">
              {bet_list.length
                ? bet_
                : this.state.award
                ? this.state.award + "獎"
                : "無獎"}
            </div>
          </div>
          <div id="marksix">
            <div id="world"></div>
            <h5>攪珠結果：</h5>
            <div id="result">
              <ul>{result_list}</ul>
            </div>
            <button
              onClick={() => this.start_roll()}
              disabled={!this.state.click}
            >
              開始攪珠
            </button>
            <h6
              id="quick_roll"
              style={{
                cursor: this.state.click ? "pointer" : "not-allowed",
                color: this.state.click ? "#00006d" : "#ccc",
              }}
              onClick={this.state.click ? () => this.quick_roll() : () => {}}
            >
              <u>快速攪珠</u>
            </h6>
          </div>
          <h6
            id="warning"
            style={{ display: this.state.open ? "block" : "none" }}
          >
            注意：攪珠時請不要切換到其他分頁，否則球會飛出範圍。
          </h6>
        </div>
      </div>
    );
  }
}

class Bet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      div: false,
      open: !phone,
      number: Array(49).fill(false),
      click: true,
    };
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        div: true,
      });
    }, 100);
    window.addEventListener("resize", () => this.forceUpdate());
    window.toggle_click = () => this.toggle_click();
  }

  toggle_open() {
    this.setState({
      open: !this.state.open,
    });
  }

  toggle_number(number) {
    var list = this.state.number;
    var counter = 0;
    list[number] = !list[number];
    for (var i of list) {
      if (i) {
        counter++;
      }
    }
    if (!list[number] || counter <= 7) {
      this.setState({
        number: list,
      });
    }
  }

  toggle_click() {
    this.setState({
      click: !this.state.click,
    });
  }

  bet() {
    var _bet = [];
    for (var i in this.state.number) {
      if (this.state.number[i]) {
        _bet.push(Number(i) + 1);
      }
    }
    if (_bet.length == 6 || _bet.length == 7) {
      bet_list = _bet;
      this.setState({
        number: Array(49).fill(false),
      });
      window.update_bet();
    }
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
        <div
          style={{
            height: "85%",
            width: "100%",
            overflowY: "scroll",
          }}
        >
          <h6 style={{ textAlign: "center" }}>
            點擊數字以選擇(只能選擇6或7個號碼)
          </h6>
          <div id="bet_no">
            {image_url.map((value, index) => (
              <img
                src={value}
                onClick={
                  this.state.click ? () => this.toggle_number(index) : () => {}
                }
                style={{
                  transform: this.state.number[index]
                    ? "scale(0.8, 0.8)"
                    : "scale(1, 1)",
                  opacity: this.state.number[index] ? "0.5" : "1",
                  cursor: this.state.click ? "pointer" : "not-allowed",
                }}
              ></img>
            ))}
          </div>
          <button
            id="bet"
            onClick={() => this.bet()}
            disabled={!this.state.click}
          >
            下注
          </button>
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
    window.update = () => this.forceUpdate();
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

    var roll_history_list = roll_history.map((value) => {
      var list = value.map((value, index) => {
        if (index == 6) {
          return (
            <div>
              <FontAwesomeIcon
                icon={faPlus}
                style={{ transform: "translateY(5px)" }}
              />
              <img src={image_url[value - 1]}></img>
            </div>
          );
        }
        return <img src={image_url[value - 1]}></img>;
      });
      return <li>{list}</li>;
    });

    return (
      <div className="VHistory right" style={div}>
        <div style={style_div}>
          <h5 style={style_h5}>模擬攪珠結果</h5>
        </div>
        <div onClick={() => this.toggle_open()}>
          <FontAwesomeIcon icon={faAngleLeft} rotation={rotation} />
        </div>
        <ul id="roll_history">{roll_history_list}</ul>
      </div>
    );
  }
}

//Render root
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
