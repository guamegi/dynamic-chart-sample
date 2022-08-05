window.onload = function () {
  test_chart_init();
};
///////////////////////////////////////////////////////////////////
// 테스트용 데이터 샘플링 - 시작

var item_name = "TEST Sampling";
var dt = new Date();
var sample_value = 10680; // 샘플데이터 시작 값
var sample_timestamp = dt.getTime() - (dt.getTime() % 1000);
var is_sampling = false;

var makeSampleData = function (baseValue) {
  var ret =
    parseFloat(baseValue) +
    ((Math.random() < 0.5 ? 1 : -1) * Math.random()) / 5;
  return ret;
};

function append_sise(time, value) {
  if (is_sampling) is_sampling = false;

  chart_data_add(mychart, time * 1000, parseFloat(value));

  // 수동으로 영역 범위 재설정
  var new_finish = mychart.calc_finish_time(
    time * 1000 - 1000,
    mychart.viewInfo.term
  ); // 30초 전까지 그리기 위하여 임시로 ...
  if (new_finish != mychart.viewInfo.finish) {
    if (
      mychart.viewInfo.start < mychart.viewInfo.finish &&
      mychart.viewInfo.end > mychart.viewInfo.finish
    ) {
      // finish 라인이 화면에 보이면 이동
      mychart.move_x(new_finish - mychart.viewInfo.finish);
      mychart.viewInfo.finish = new_finish;
    } else {
      // finish 라인이 화면에 안보이면 finish 라인만 재지정
      mychart.viewInfo.finish = new_finish;
    }
  }
  mychart.start_time = new Date().getTime();
}

function make_sample() {
  if (!is_sampling) return;

  sample_value = parseFloat(makeSampleData(sample_value)).toFixed(3);
  sample_timestamp += 1000;
  //console.log("date:"+sample_timestamp+", value:"+sample_value);

  chart_data_add(mychart, sample_timestamp, parseFloat(sample_value));

  // 수동으로 영역 범위 재설정
  var new_finish = mychart.calc_finish_time(
    sample_timestamp - 1000,
    mychart.viewInfo.term
  ); // finish 라인까지 그리기 위하여 finish라인 변환을 1초 늦춤
  if (new_finish != mychart.viewInfo.finish) {
    if (
      mychart.viewInfo.start < mychart.viewInfo.finish &&
      mychart.viewInfo.end > mychart.viewInfo.finish
    ) {
      // finish 라인이 화면에 보이면 화면이 이동
      mychart.move_x(new_finish - mychart.viewInfo.finish);
      mychart.viewInfo.finish = new_finish;
    } else {
      // finish 라인이 화면에 안보이면 finish 라인만 재지정
      mychart.viewInfo.finish = new_finish;
    }
  }
  mychart.start_time = new Date().getTime();
}

var sample_interval = setInterval(make_sample, 1000);

// 테스트용 데이터 샘플링 - 끝
///////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////
// 테스트용 차트
var mychart = null;
var language;
if (window.navigator.languages) {
  language = window.navigator.languages[0];
} else {
  language = window.navigator.userLanguage || window.navigator.language;
}

function test_chart_init() {
  mychart = new SWCHART("canvas");
  var c_data = mychart.currentDataInfo;
  var c_view = mychart.viewInfo;

  // 추후, 서버 실시간 데이터를 받아서 초기화
  c_data.current = new Date().getTime();
  c_data.current -= c_data.current % 1000;
  c_data.zerotime = c_data.current - c_data.range * 1000;
  c_data.data = [];
  for (var i = 0; i < c_data.range; i++) {
    sample_value = parseFloat(makeSampleData(sample_value)).toFixed(3);
    c_data.data.push(parseFloat(sample_value));
  }

  // 기본 view 영역 세팅
  c_view.finish = mychart.calc_finish_time();
  c_view.end = c_view.finish + 28000;
  c_view.start = c_view.end - 224000;

  mychart.start_time = new Date().getTime();
  is_sampling = true;
  mychart.draw_call();
}

///////////////////////////////////////////////////////////////////
// 테스트용 차트 샘플 - 시작

function SWCHART(holderId) {
  // 펜
  this.pen = {};
  this.pen.base = {
    strokeColor: "#000000",
    fillColor: "#FFFFFF",
    lineWidth: 1,
    alpha: 1,
    font: "20pt Verdana",
  };
  this.pen.background = {
    strokeColor: "#000000",
    fillColor: "#FFFFFF",
    lineWidth: 1,
    alpha: 0.3,
    font: "50pt Verdana",
    textAlign: "center",
    textBaseline: "middle",
  };
  this.pen.grid_x = {
    strokeColor: "#777777",
    fillColor: "#FFFFFF",
    lineWidth: 1,
    alpha: 0.2,
    textAlign: "center",
    textBaseline: "bottom",
  };
  this.pen.grid_y = {
    strokeColor: "#777777",
    fillColor: "#FFFFFF",
    lineWidth: 1,
    alpha: 0.2,
    textAlign: "right",
    textBaseline: "middle",
  };
  this.pen.line = { strokeColor: "#0088FF", lineWidth: 2, alpha: 1 };
  this.pen.current_index = {
    strokeColor: "#F8AB39",
    fillColor: "rgba(255,255,255,0.3)",
    lineWidth: 0.5,
    alpha: 1,
    font: "10pt Verdana",
    textAlign: "center",
    textBaseline: "middle",
  };
  this.pen.current_value = {
    strokeColor: "#F8AB39",
    fillColor: "white",
    lineWidth: 0.5,
    alpha: 1,
    font: "10pt Verdana",
    textAlign: "center",
    textBaseline: "middle",
  };
  this.pen.start_line = {
    strokeColor: "#FFFFFF",
    fillColor: "#FFFFFF",
    lineWidth: 1,
    alpha: 1,
  };
  this.pen.finish_line = {
    strokeColor: "#FFFF00",
    fillColor: "#FFFFFF",
    lineWidth: 0.8,
    alpha: 1,
  };
  this.pen.cursor_line = {
    strokeColor: "#FF0000",
    lineWidth: 0.5,
    alpha: 1,
  };
  this.pen.cursor_line_value_x = {
    strokeColor: "#F8AB39",
    fillColor: "white",
    lineWidth: 0.5,
    alpha: 1,
    font: "10pt Verdana",
    textAlign: "center",
    textBaseline: "middle",
  };
  this.pen.cursor_line_value_y = {
    strokeColor: "#F8AB39",
    fillColor: "white",
    lineWidth: 0.5,
    alpha: 1,
    font: "10pt Verdana",
    textAlign: "center",
    textBaseline: "middle",
  };

  this.currentDataInfo = null;

  // 기본데이터 정보 생성
  this.dataInfo = {
    line: {
      interval: 1000, // 1 second = 1000, 각 데이터 간의 간격 timestamp 크기
      zerotime: null, // data[0] 의 시간
      current: null, // data[data.length -1] 의 시간
      data: [], // 데이터 값 배열
      range: 3600, // seconds
      nd: 3, // 소수점 이하 자리수
    },
  };

  // 기본 데이터 정보
  this.currentDataInfo = this.dataInfo.line;

  // 출력 정보
  // ......................................................................................
  // 화면에 표시할 범위 계산
  // ----------------------------------------------
  // 마감상품       차트 표시 시간             엔드라인비율         엔드라인의 초(차트 시작 부분부터 보이는 초)
  // ----------------------------------------------
  // 1분 후 마감 : 224" 			: 87.5% 		196", 28"
  // 2분 후 마감 : 224" 			: 87.5% 		196", 28"
  // 3분 후 마감 : 304"     		: 87.5% 		266", 38"
  // 4분 후 마감 : 360"     		: 87.5% 		315", 45"
  // 5분 후 마감 : 480"     		: 87.5% 		420", 60"

  // 현재초가 30 미만인경우, 현재 분도 마감 상품 남은 시간에 포함
  // ......................................................................................
  this.viewInfo = {};
  this.viewInfo.geometry = {};
  this.viewInfo.geometry.margin = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  };
  this.viewInfo.geometry.cursorLineValueBox = { width: 80, height: 20 };
  this.viewInfo.start = null; // view start (float)
  this.viewInfo.end = null; // view end (float)
  this.viewInfo.min = 0; // min value of view range
  this.viewInfo.max = 0; // max value of view range
  this.viewInfo.zoom_rate = 0.1;
  this.viewInfo.finish_rate = 0.875;
  this.viewInfo.finish = null;
  this.viewInfo.gridYCountMax = 20;
  this.viewInfo.gridYCountMin = 5;
  this.viewInfo.minmax_padding_rate = 0.2; // 최대값 상하에 추가할 패딩 영역 크기
  this.viewInfo.term = 1; // 마감상품 거리

  this.viewInfo.is_cursor_line_x = true;
  this.viewInfo.is_cursor_line_y = true;
  this.viewInfo.is_cursor_line_value_x = true;
  this.viewInfo.is_cursor_line_value_y = true;
  this.viewInfo.is_data_area_fill = true;

  this.canvas = document.getElementById(holderId);
  this.context = this.canvas.getContext("2d"); // TODO : 컨텍스트를 계속 재배정 해야하는지 여부 테스트 할것

  // 현재 시세 포인터
  this.current_pointer_img = new Image();
  this.pointer_interval = 30; // 3초단위로 깜빡임 효과. 0.1초 단위. (ex: 0.1 * 30 = 3)
  this.pointer_min_radius = 5; // 현재 시세 포인터 배경 최소 크기

  // 배경 이미지
  this.bg = new Image();
  // 애니메이션 프레임 관련 정보
  this.fps = 60;
  this.interval_handler = null;
  this.interval = 1000 / this.fps;
  this.frame_counter = 0;
  this.start_time = null; // 마지막 노드 추가시간
  this.animation_duration = 400;

  // 마우스 커서 위치
  this.cursor_x = null;
  this.cursor_y = null;

  this.xGridInterval = 15000;

  this.down_x = null;
  this.down_y = null;

  this.is_first = true;

  // 차트 위치 계산에 필요한 변수들
  this.d_w = 0;
  this.d_h = 0;
  this.start_index = 0;
  this.end_index = 0;
  this.diff_val = 0;
  this.grid_max = 0;
  this.grid_min = 0;
  this.next_x = null;
  this.next_y = null;

  this.c_time = 0; // drawing 프레임 진입시간

  // x축 횡이동 애니메이션
  this.x_duration = 300;
  this.x_start_time = 0;
  this.x_from = 0;
  this.x_to = 0;

  // y축 애니메이션
  this.y_duration = 300;
  this.y_start_time = 0;
  this.y_min_from = 0;
  this.y_min_to = 0;
  this.y_max_from = 0;
  this.y_max_to = 0;

  return this;
}

// y축 애니메이션 이동을 지정한다.
SWCHART.prototype.move_y = function (to_min, to_max) {
  if (this.grid_min == 0 || this.grid_max == 0) {
    // 기존 범위가 없는 경우는 그냥 지정후 리턴
    this.grid_min = to_min;
    this.grid_max = to_max;
    return;
  }
  this.y_min_from = this.grid_min;
  this.y_min_to = to_min;
  this.y_max_from = this.grid_max;
  this.y_max_to = to_max;
  this.y_start_time = new Date().getTime(); // 현재 시간
};

// x축 애니메이션 이동을 지정한다. @to 는 x축으로 이동할 거리를 시간으로 환산한 값이다.
SWCHART.prototype.move_x = function (to) {
  this.x_from = this.viewInfo.start;
  this.x_to = this.x_from + to;
  this.x_start_time = new Date().getTime(); // 현재 시간
};

// 화면의 현재 넓이를 기준으로 가장 마지막 구간을 보여준다.
SWCHART.prototype.move_x_end = function () {
  this.x_from = this.viewInfo.start;
  this.x_to =
    (this.viewInfo.end - this.viewInfo.start) *
      (1 - this.viewInfo.finish_rate) +
    this.viewInfo.finish -
    (this.viewInfo.end - this.viewInfo.start);
  this.x_start_time = new Date().getTime(); // 현재 시간
};

// 화면에 출력할 주 데이터 셋을 추가한다. (라인, 캔들, 파이프)
SWCHART.prototype.add_data_info = function (dataSetName, dataSet) {
  if (dataSetName == undefined || dataSetName == null) return; // 일단, 이름 없으면 무시함
  if (dataSet == undefined || dataSet == null) return; // 데이터 셋이 없어도 무시
  this.dataInfo[dataSetName] = dataSet;
};

SWCHART.prototype.make_data_info = function (copySetName) {
  var ret = {
    interval: 1000, // 1 second = 1000, 각 데이터 간의 간격 timestamp 크기
    zerotime: null, // data[0] 의 시간
    current: null, // data[data.length -1] 의 시간
    data: [], // 데이터 값 배열
    range: 224, // seconds
    nd: 3,
  };
  if (
    copySetName != undefined &&
    copySetName != null &&
    this.dataInfo[copySetName] != undefined &&
    this.dataInfo[copySetName] != null
  ) {
    var s = this.dataInfo[copySetName];
    ret.interval = s.interval;
    ret.zerotime = s.zerotime;
    ret.current = s.current;
    ret.data = s.data;
    ret.range = s.range;
    ret.nd = s.nd;
  }

  return ret;
};

// 지정된 데이터 셋을 제거한다.
// TODO : 현재 사용중인 데이터를 보호할 것인지..
SWCHART.prototype.remove_data_info = function (dataSetName) {
  if (dataSetName == undefined || dataSetName == null) return;
  this.dataInfo[dataSetName] = null;
  delete this.dataInfo[dataSetName];
};

// 현재 지정된 데이터 셋을 변경한다.
SWCHART.prototype.change_current_data_info = function (dataSetName, dataSet) {
  if (dataSet != undefined || dataSet != null) {
    // 데이터 셋이 있으면, 데이터 셋을 추가하고 변경한다.
    this.add_data_info(dataSetName, dataSet);
  }

  if (dataSetName == undefined || dataSetName == null) {
    this.currentDataInfo = null;
  } else {
    if (
      this.dataInfo[dataSetName] == undefined ||
      this.dataInfo[dataSetName] == null
    ) {
      // 그런거 없으므로 무시
      return;
    }
    this.currentDataInfo = this.dataInfo[dataSetName];
  }
};

// 지정된 시간과 마감 간격을 기준으로, 바이너리 옵션의 투자 마감 시간을 산출한다.
SWCHART.prototype.calc_finish_time = function (baseTime, term = 1) {
  if (baseTime == undefined || baseTime == null) {
    baseTime = new Date().getTime();
    baseTime -= baseTime % 1000;
  }

  var ret = parseInt(baseTime / 1000); // 초단위 변경

  // 30초 이후에 1분 추가
  if (ret % 60 > 30) ret += 60;

  ret = ret + (60 - (ret % 60)) + 60 * (term - 1);
  return ret * 1000;
};

// 과거 시세 데이터 추가
// NOTE : timestamp는 밀리초 가 000으로 제거된 데이터 사용
SWCHART.prototype.prepend_data = function (d, is_new) {
  if (this.currentDataInfo.zerotime == null || is_new) {
    // 최초 초기화
    var data = [];

    var prev_time = null;
    if (d.ti.length > 0) {
      prev_time = d.ti[0][0];
    }
    for (var i = 0; i < d.ti.length; i++) {
      // 뭐좀 깔끔하게 안되나..
      for (
        var t = prev_time;
        t < d.ti[i][0];
        t += this.currentDataInfo.interval / 1000
      ) {
        data.push(d.ti[i - 1][1]);
      }
      data.push(d.ti[i][1]); // 0 : unix timestamp, 1 : value
      prev_time = d.ti[i][0] + this.currentDataInfo.interval / 1000;
    }

    this.currentDataInfo.zerotime = d.ti[0][0] * 1000;
    this.currentDataInfo.current = d.ti[d.ti.length - 1][0] * 1000;
    this.currentDataInfo.data = data;
    this.currentDataInfo.nd = d.nd;
  } else {
    // 기존 데이터에 추가
    var newDataSet = this.make_data_info("line");
    newDataSet.nd = d.nd;
    newDataSet.data = [];

    var prev_time = null;
    if (d.ti.length > 0) {
      prev_time = d.ti[0][0];
    }
    for (var i = 0; i < d.ti.length; i++) {
      // 뭐좀 깔끔하게 안되나..
      for (
        var t = prev_time;
        t < d.ti[i][0];
        t += this.currentDataInfo.interval / 1000
      ) {
        newDataSet.data.push(d.ti[i - 1][1]);
      }
      newDataSet.data.push(d.ti[i][1]); // 0 : unix timestamp, 1 : value
      prev_time = d.ti[i][0] + this.currentDataInfo.interval / 1000;
    }

    newDataSet.zerotime = d.ti[0][0] * 1000;
    newDataSet.current = d.ti[d.ti.length - 1][0] * 1000;

    // 기존데이터와의 사이에 데이터 간격 확인 (연속성 확보)
    var t_idx =
      (this.currentDataInfo.zerotime -
        newDataSet.current +
        newDataSet.interval) /
      1000;
    if (t_idx == 0) {
      // 1. 정합. 시간 연속인경우 : t_idx = 0. 기존데이터를 연속으로 붙인다.
      newDataSet.data.concat(this.currentDataInfo.data);
    } else if (t_idx < 0) {
      // 2. 겹침. 겹치는 구간이 발생하면, 새로 받은 데이터를 우선함 : t_idx < 0
      for (var i = t_idx * -1; i < this.currentDataInfo.data.length; i++) {
        newDataSet.data.push(this.currentDataInfo.data[i]);
      }
    } else {
      // 3. 빈공간. 여러 이유로 연속성이 없음. 빈공간은 채우고 붙임 : t_idx > 0
      for (var i = 0; i < t_idx; i++) {
        newDataSet.data.push(newDataSet.data[newDataSet.data.length - 1]);
      }
      newDataSet.data.concat(this.currentDataInfo.data);
    }

    newDataSet.current =
      newDataSet.zerotime + newDataSet.data.length * newDataSet.interval;

    // 데이터 크기가 벗어나면 잘라서 맞춤
    if (newDataSet.data.length > newDataSet.range) {
      newDataSet.data.splice(0, newDataSet.data.length - newDataSet.range);
      newDataSet.zerotime =
        newDataSet.current - newDataSet.range * newDataSet.interval;
    }
    this.change_current_data_info("line", newDataSet);
  }
};

SWCHART.prototype.draw_call = function () {
  // 동작중이면 무시
  if (this.interval_handler != null) return;

  if (this.is_first) {
    var sw = this;

    this.canvas.addEventListener("mousedown", function (e) {
      sw.my_mousedown(e, sw);
    });
    this.canvas.addEventListener("mousemove", function (e) {
      sw.my_mousemove(e, sw);
    });
    this.canvas.addEventListener("mouseout", function (e) {
      sw.my_mouseout(e, sw);
    });
    this.canvas.addEventListener("mousewheel", function (e) {
      sw.my_mousewheel(e, sw);
    });

    this.is_first = false;
  }

  // 시작 시간 보관
  this.frame_counter = 0;
  this.start_time = new Date().getTime();

  this.interval_handler = setInterval(this.draw, this.interval, this);
};

// @param sw setInterval에 의해 실행되는 경우는 this 자체가 window가 되므로 별도로 전달
SWCHART.prototype.draw = function (sw) {
  if (sw == undefined || sw == null) sw = this;

  var ctx = sw.context;
  var cvs = sw.canvas;
  var margin = sw.viewInfo.geometry.margin;
  var dataInfo = sw.currentDataInfo;
  var viewInfo = sw.viewInfo;

  sw.c_time = new Date().getTime(); // 프레임 진입 시간
  var diff_time = sw.c_time - sw.start_time; // animation start 로 부터 흐른 시간
  if (sw.start_time == 0) {
    diff_time = 0;
  } // TODO : is_animation_on 을 이용하여 애니메이션 동작 여부 결정

  //////////////////////////////
  // x축 횡이동
  if (sw.x_start_time != null) {
    if (sw.x_start_time + sw.x_duration >= sw.c_time) {
      // 지정된 구간에 있는 중
      // 필요한 만큼만 적용
      var xGap =
        ((sw.x_to - sw.x_from) * (sw.c_time - sw.x_start_time)) / sw.x_duration;
    } else {
      // 애니메이션이 시간은 초과 되었으나 남은 상태
      // => 남아있는 무빙을 모두 적용
      var xGap = sw.x_to - sw.x_from;
      sw.x_start_time = null; // 적용후 무빙 시작시간 제거. 다음 프레임부터 적용 안함
    }
    if (sw.x_from + xGap <= sw.x_to && sw.x_to >= sw.viewInfo.start) {
      sw.viewInfo.end += sw.x_from + xGap - sw.viewInfo.start;
      sw.viewInfo.start = sw.x_from + xGap;
    }
  }
  // x축 횡이동
  //////////////////////////////////

  var animationStep = diff_time % 1000; // 애니메이션 동작 시간
  if (diff_time >= 1000) animationStep = 1000;
  sw.frame_counter++; // 디버깅용

  cvs.width = cvs.scrollWidth;
  cvs.height = cvs.scrollHeight;

  sw.d_w = cvs.width - margin.left - margin.right;
  sw.d_h = cvs.height - margin.top - margin.bottom;

  // 데이터배열에서 출력해야할 시작 인덱스
  sw.start_index = (sw.viewInfo.start - dataInfo.zerotime) / dataInfo.interval;
  if (sw.start_index > parseInt(sw.start_index))
    sw.start_index = parseInt(sw.start_index) - 1;
  if (sw.start_index < 0) sw.start_index = 0;

  // 데이터배열에서 출력해야할 종료 인덱스
  sw.end_index = dataInfo.data.length - 1;
  if (sw.viewInfo.end < sw.viewInfo.current) {
    var tmp_end = parseInt(sw.viewInfo.end);
    if (tmp_end < sw.viewInfo.end) tmp_end += dataInfo.interval;
    sw.end_index = (tmp_end - dataInfo.zerotime) / dataInfo.interval;
    if (sw.end_index > parseInt(sw.end_index))
      sw.end_index = parseInt(sw.end_index) + 1;
  }

  ///////////////////////////////////////////////////////
  // 배경 - 시작
  ctx.save();
  sw.set_pen("background");
  ctx.drawImage(sw.bg, margin.left, margin.top, sw.d_w, sw.d_h);

  ctx.beginPath();
  // 아이템 종목
  var dim = ctx.measureText(item_name);
  ctx.fillText(item_name, dim.width / 2 + 20, 100);

  // 서버에서 받은 최종 시세 시간
  ctx.fillText(
    sw_timeToText(dataInfo.current) + "(" + language + ")",
    sw.adjustPixel_x(sw, sw.d_w / 2),
    sw.adjustPixel_y(sw, sw.d_h / 2)
  );

  ctx.restore();
  // 배경 - 끝
  ///////////////////////////////////////////////////////

  ///////////////////////////////////////////////
  // X axis, grid 세로선 - 시작
  ctx.save();

  sw.set_pen("grid_x");
  ctx.beginPath();

  // X axis, grid 세로선
  var xGridInterval = sw.xGridInterval; // TODO : 설정에 의해서 그려지도록 변경... xGridInterval = [15초, 30초, 1분, 5분, 10분, 30분, 1시간, .... ];
  var st_i = xGridInterval - (sw.viewInfo.start % xGridInterval);
  if (st_i == xGridInterval) st_i = 0;

  for (var i = st_i + viewInfo.start; i < viewInfo.end; i = i + xGridInterval) {
    sw.moveToVP(sw, i, 0);
    sw.lineToVP(sw, i, sw.d_h);
    ctx.fillText(
      sw_timeToText(i),
      sw.valueToPixel_x(sw, i),
      sw.adjustPixel_y(sw, 0)
    );
  }

  ctx.stroke();
  ctx.restore();
  // X axis, grid 세로선 - 끝
  ///////////////////////////////////////////////

  ///////////////////////////////////////////////
  // Y axis, grid 가로선 - 시작
  // 선의 개수는 10~20개
  // 소수점 고려.
  ctx.save();

  sw.set_pen("grid_y");
  ctx.beginPath();

  // y축 종이동은 calc_min_max 내부에서 적용
  sw.calc_min_max();

  // y단위 지정
  var y_unit = sw.calc_y_grid_unit();

  // 첫번째 라인 그려질 위치 지정
  var yGridGap = y_unit - (sw.grid_min % y_unit);

  for (var i = sw.grid_min + yGridGap; i < sw.grid_max; i += y_unit) {
    sw.moveToPV(sw, 0, i);
    sw.lineToPV(sw, sw.d_w, i);
    ctx.fillText(
      i.toFixed(sw.currentDataInfo.nd).toString(),
      sw.adjustPixel_x(sw, sw.d_w),
      sw.valueToPixel_y(sw, i)
    );
  }

  ctx.stroke();
  ctx.restore();
  // Y axis, grid 가로선 - 끝
  ///////////////////////////////////////////////

  // 데이터
  sw.draw_data(animationStep);

  // 시세 표시 선
  sw.draw_current_value_line(animationStep);

  // 결정구간 표시
  sw.draw_determine_area();

  // 현재 시세 포인터 배경
  sw.draw_current_value_pointer();

  // cursor 라인
  if (sw.cursor_x != null && sw.cursor_y != null) {
    sw.draw_cursor();
  }
  ctx.restore();
};

//////////////////////////////////////////
//// 드로잉 함수 분할
SWCHART.prototype.draw_data = function (animationStep) {
  this.context.save();
  this.set_pen("line");

  var start_index_time;
  var x_distance;
  var y_distance;
  if (this.viewInfo.is_data_area_fill) {
    // 데이터 영역 채우기
    this.context.beginPath();

    this.moveToPP(this, 0, 0);
    this.lineToPV(this, 0, this.currentDataInfo.data[this.start_index]);

    // 애니메이션 효과 적용
    // data.current 전까지는 모두 그림
    start_index_time =
      this.currentDataInfo.zerotime +
      this.start_index * this.currentDataInfo.interval;
    for (var i = this.start_index; i < this.end_index; i++) {
      this.lineToVV(
        this,
        this.currentDataInfo.zerotime + i * this.currentDataInfo.interval,
        this.currentDataInfo.data[i]
      );
    }

    this.next_x =
      this.currentDataInfo.zerotime +
      this.end_index * this.currentDataInfo.interval;
    this.next_y = this.currentDataInfo.data[this.end_index];
    if (animationStep < this.animation_duration) {
      // 애니메이션 스텝을 위한 거리 분할
      x_distance =
        this.currentDataInfo.zerotime +
        this.end_index * this.currentDataInfo.interval -
        (this.currentDataInfo.zerotime +
          (this.end_index - 1) * this.currentDataInfo.interval);
      y_distance =
        this.currentDataInfo.data[this.end_index] -
        this.currentDataInfo.data[this.end_index - 1];

      this.next_x =
        this.currentDataInfo.zerotime +
        (this.end_index - 1) * this.currentDataInfo.interval +
        (x_distance * animationStep) / this.animation_duration;
      this.next_y =
        this.currentDataInfo.data[this.end_index - 1] +
        (y_distance * animationStep) / this.animation_duration;
    }
    this.lineToVV(this, this.next_x, this.next_y);

    this.lineToVP(this, this.next_x, 0);

    this.context.closePath();

    // fillStyle 별도 지정
    var my_gradient = this.context.createLinearGradient(
      0,
      0,
      0,
      this.canvas.height
    );
    my_gradient.addColorStop(0, "rgba(0, 128, 255, 0.5)");
    my_gradient.addColorStop(1, "rgba(0, 128, 255, 0.1)");
    this.context.fillStyle = my_gradient;
    this.context.fill();
  }

  ///////////////////////////////////////////////
  // 데이터 라인 그림 - 시작
  this.context.beginPath();
  this.moveToPV(this, 0, this.currentDataInfo.data[this.start_index]);

  // targetStep  전까지는 모두 그림
  start_index_time =
    this.currentDataInfo.zerotime +
    this.start_index * this.currentDataInfo.interval;
  for (var i = this.start_index; i < this.end_index; i++) {
    this.lineToVV(
      this,
      this.currentDataInfo.zerotime + i * this.currentDataInfo.interval,
      this.currentDataInfo.data[i]
    );
  }

  // 애니메이션 효과 적용
  this.next_x =
    this.currentDataInfo.zerotime +
    this.end_index * this.currentDataInfo.interval;
  this.next_y = this.currentDataInfo.data[this.end_index];
  if (animationStep < this.animation_duration) {
    // 애니메이션 스텝을 위한 거리 분할
    x_distance =
      this.currentDataInfo.zerotime +
      this.end_index * this.currentDataInfo.interval -
      (this.currentDataInfo.zerotime +
        (this.end_index - 1) * this.currentDataInfo.interval);
    y_distance =
      this.currentDataInfo.data[this.end_index] -
      this.currentDataInfo.data[this.end_index - 1];

    this.next_x =
      this.currentDataInfo.zerotime +
      (this.end_index - 1) * this.currentDataInfo.interval +
      (x_distance * animationStep) / this.animation_duration;
    this.next_y =
      this.currentDataInfo.data[this.end_index - 1] +
      (y_distance * animationStep) / this.animation_duration;
  }
  this.lineToVV(this, this.next_x, this.next_y);

  this.context.stroke();
  this.context.restore();
};

SWCHART.prototype.draw_current_value_line = function () {
  this.set_pen("current_index");

  var siseBoxWidth = 90;
  var siseBoxHeight = 30;
  this.context.beginPath();
  this.moveToPV(this, 0, this.next_y);
  this.lineToPV(
    this,
    this.valueToPixel_x(this, this.viewInfo.end) -
      siseBoxWidth -
      siseBoxHeight / 2,
    this.next_y
  );
  this.context.stroke();
  this.context.beginPath();
  this.context.arc(
    this.d_w - siseBoxWidth,
    this.valueToPixel_y(this, this.next_y),
    siseBoxHeight / 2,
    Math.PI * 0.5,
    Math.PI * 1.5
  );
  this.context.lineTo(
    this.d_w - siseBoxWidth / 3,
    this.valueToPixel_y(this, this.next_y) - siseBoxHeight / 2
  );
  this.context.arc(
    this.d_w - siseBoxWidth / 3,
    this.valueToPixel_y(this, this.next_y),
    siseBoxHeight / 2,
    Math.PI * 1.5,
    Math.PI * 0.5
  );
  this.context.lineTo(
    this.d_w - siseBoxWidth,
    this.valueToPixel_y(this, this.next_y) + siseBoxHeight / 2
  );
  this.context.closePath();
  this.context.fill();
  this.context.stroke();

  this.set_pen("current_value");

  // 시세값 표시
  this.context.fillText(
    this.next_y.toFixed(this.currentDataInfo.nd).toString(),
    this.d_w - (siseBoxWidth * 2) / 3,
    this.valueToPixel_y(this, this.next_y)
  );
  this.context.stroke();
};

SWCHART.prototype.draw_current_value_pointer = function () {
  var p_x = this.valueToPixel_x(this, this.next_x);
  var p_y = this.valueToPixel_y(this, this.next_y);
  var pointer_radius = parseInt(
    ((this.c_time - (this.c_time % 100)) / 100) % this.pointer_interval
  );
  if (pointer_radius > this.pointer_interval / 2) {
    pointer_radius = this.pointer_interval - pointer_radius;
  }
  pointer_radius =
    this.pointer_min_radius +
    pointer_radius / (this.pointer_interval / 2 / this.pointer_min_radius);

  this.context.fillStyle =
    "rgba(" +
    (255 - pointer_radius * 10) +
    ", " +
    (255 - pointer_radius * 10) +
    "," +
    (255 - pointer_radius * 10) +
    ",1)";

  // fillStyle은 별도 지정
  var pointer_gradient = this.context.createRadialGradient(
    p_x,
    p_y,
    5,
    p_x,
    p_y,
    pointer_radius
  );
  pointer_gradient.addColorStop(0, "rgba(255,255,255,1)");
  pointer_gradient.addColorStop(1, "rgba(255,255,255,0.5)");
  this.context.beginPath();
  this.context.arc(p_x, p_y, pointer_radius, 0, 2 * Math.PI);
  this.context.fill();

  // 포인터 (지구) 이미지
  p_x -= 5;
  p_y -= 5;
  this.context.drawImage(this.current_pointer_img, p_x, p_y, 10, 10);
};

SWCHART.prototype.draw_determine_area = function () {
  // background fill
  var d_area_gradient = this.context.createLinearGradient(
    this.valueToPixel_x(this, this.viewInfo.finish - 30000),
    0,
    this.valueToPixel_x(this, this.viewInfo.finish),
    0
  );

  // 색상을 설정에서 가져오도록 변경
  d_area_gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)");
  d_area_gradient.addColorStop(1, "rgba(255, 255, 0, 0.2)");
  this.context.fillStyle = d_area_gradient;

  this.context.beginPath();
  this.moveToVP(this, this.viewInfo.finish - 30000, 0); // TODO : 하드코딩 제거
  this.lineToVP(this, this.viewInfo.finish, 0);
  this.lineToVP(this, this.viewInfo.finish, this.d_h);
  this.lineToVP(this, this.viewInfo.finish - 30000, this.d_h);
  this.context.closePath();
  this.context.fill();

  // start line
  this.set_pen("start_line");
  this.context.save();
  this.context.restore();

  this.context.beginPath();
  this.moveToVP(this, this.viewInfo.finish - 30000, 0); // TODO : 하드코딩 제거
  this.lineToVP(this, this.viewInfo.finish - 30000, this.d_h);
  this.context.stroke();

  // end line
  this.set_pen("finish_line");
  this.context.save();

  this.context.beginPath();
  this.moveToVP(this, this.viewInfo.finish, 0);
  this.lineToVP(this, this.viewInfo.finish, this.d_h);
  this.context.stroke();
};

SWCHART.prototype.draw_cursor = function () {
  // 좌우 범위 확인
  if (
    this.cursor_x <= this.viewInfo.geometry.margin.left ||
    this.cursor_x > this.canvas.width - this.viewInfo.geometry.margin.right
  )
    return;

  // 상하 범위 확인
  if (
    this.cursor_y <= this.viewInfo.geometry.margin.top ||
    this.cursor_y > this.canvas.height - this.viewInfo.geometry.margin.bottom
  )
    return;

  this.set_pen("cursor_line");

  this.context.beginPath();
  if (this.viewInfo.is_cursor_line_x) {
    this.context.moveTo(0, this.cursor_y);
    this.context.lineTo(this.canvas.width, this.cursor_y);
  }
  if (this.viewInfo.is_cursor_line_y) {
    this.context.moveTo(this.cursor_x, this.adjustPixel_y(this, 0));
    this.context.lineTo(this.cursor_x, this.adjustPixel_y(this, this.d_h));
  }
  this.context.stroke();

  // value box
  this.context.beginPath();
  if (this.viewInfo.is_cursor_line_value_x) {
    this.set_pen("current_index");
    this.context.fillRect(
      this.cursor_x - this.viewInfo.geometry.cursorLineValueBox.width / 2,
      this.adjustPixel_y(this, 0) -
        this.viewInfo.geometry.cursorLineValueBox.height,
      this.viewInfo.geometry.cursorLineValueBox.width,
      this.viewInfo.geometry.cursorLineValueBox.height
    );
    this.set_pen("cursor_line_value_x");
    this.context.fillText(
      sw_timeToText(this.pixelToValue_x(this, this.cursor_x)),
      this.cursor_x,
      this.adjustPixel_y(
        this,
        this.viewInfo.geometry.cursorLineValueBox.height / 2
      )
    );
  }
  if (this.viewInfo.is_cursor_line_value_y) {
    this.set_pen("current_index");
    this.context.fillRect(
      this.canvas.width - this.viewInfo.geometry.cursorLineValueBox.width,
      this.cursor_y - this.viewInfo.geometry.cursorLineValueBox.height / 2,
      this.viewInfo.geometry.cursorLineValueBox.width,
      this.viewInfo.geometry.cursorLineValueBox.height
    );
    this.set_pen("cursor_line_value_y");
    this.context.fillText(
      this.pixelToValue_y(this, this.cursor_y)
        .toFixed(this.currentDataInfo.nd)
        .toString(),
      this.adjustPixel_x(this, this.d_w) -
        this.viewInfo.geometry.cursorLineValueBox.width / 2,
      this.cursor_y
    );
  }
  this.context.stroke();
};

///////////////////////////////////////
///////// prototype function 들은 나중에 다시 작성

SWCHART.prototype.calc_min_max = function () {
  var max_val = this.currentDataInfo.data[this.start_index];
  var min_val = this.currentDataInfo.data[this.start_index];
  for (var i = this.start_index; i <= this.end_index; i++) {
    if (max_val < this.currentDataInfo.data[i])
      max_val = this.currentDataInfo.data[i];
    if (min_val > this.currentDataInfo.data[i])
      min_val = this.currentDataInfo.data[i];
  }

  this.diff_val = max_val - min_val; // 최대,최소값 차이
  max_val = max_val + this.diff_val * this.viewInfo.minmax_padding_rate;
  min_val = min_val - this.diff_val * this.viewInfo.minmax_padding_rate;
  if (min_val < 0) min_val = 0;

  this.diff_val = this.grid_max - this.grid_min;

  // y 축 애니메이션 종료 검토
  if (
    this.y_start_time > 0 &&
    this.c_time - this.y_start_time > this.y_duration
  ) {
    this.y_start_time = 0;
  }

  if (this.y_min_to != min_val || this.y_max_to != max_val) {
    // 애니메이션 다시 지정
    this.move_y(min_val, max_val);
  }

  // y축 그리드 범위 지정
  if (this.y_start_time > 0) {
    this.grid_min =
      this.y_min_from +
      ((this.c_time - this.y_start_time) * (this.y_min_to - this.y_min_from)) /
        this.y_duration;
    this.grid_max =
      this.y_max_from +
      ((this.c_time - this.y_start_time) * (this.y_max_to - this.y_max_from)) /
        this.y_duration;
  } else {
    this.grid_max = max_val;
    this.grid_min = min_val;
  }
};

///// convert value to coordinate or convert coordinate to value
SWCHART.prototype.pixelToValue_x = function (sw, x) {
  if (x <= sw.viewInfo.geometry.margin.left) {
    return sw.viewInfo.start;
  }
  if (x > sw.canvas.width - sw.viewInfo.geometry.margin.right) {
    return sw.viewInfo.end;
  }
  return (
    sw.viewInfo.start +
    ((sw.viewInfo.end - sw.viewInfo.start) *
      (x - sw.viewInfo.geometry.margin.left)) /
      sw.d_w
  );
};

SWCHART.prototype.pixelToValue_y = function (sw, y) {
  if (y <= sw.viewInfo.geometry.margin.top) {
    return sw.grid_min;
  }
  if (y > sw.canvas.height - sw.viewInfo.geometry.margin.bottom) {
    return sw.grid_max;
  }
  return (
    sw.grid_max - (sw.diff_val * (y - sw.viewInfo.geometry.margin.top)) / sw.d_h
  );
};

SWCHART.prototype.adjustPixel_x = function (sw, x) {
  return x + sw.viewInfo.geometry.margin.left;
};

SWCHART.prototype.adjustPixel_y = function (sw, y) {
  return sw.canvas.height - sw.viewInfo.geometry.margin.bottom - y;
};

SWCHART.prototype.valueToPixel_x = function (sw, xv) {
  var x =
    ((sw.canvas.width -
      sw.viewInfo.geometry.margin.left -
      sw.viewInfo.geometry.margin.right) *
      (xv - sw.viewInfo.start)) /
    (sw.viewInfo.end - sw.viewInfo.start);

  return sw.adjustPixel_x(sw, x);
};

SWCHART.prototype.valueToPixel_y = function (sw, yv) {
  var y =
    ((sw.canvas.height -
      sw.viewInfo.geometry.margin.bottom -
      sw.viewInfo.geometry.margin.top) /
      sw.diff_val) *
    (yv - sw.grid_min);
  return sw.adjustPixel_y(sw, y);
};

// move
SWCHART.prototype.moveToPP = function (sw, x, y) {
  sw.context.moveTo(sw.adjustPixel_x(sw, x), sw.adjustPixel_y(sw, y));
};
SWCHART.prototype.moveToVP = function (sw, xv, y) {
  sw.context.moveTo(sw.valueToPixel_x(sw, xv), sw.adjustPixel_y(sw, y));
};

SWCHART.prototype.moveToPV = function (sw, x, yv) {
  sw.context.moveTo(sw.adjustPixel_x(sw, x), sw.valueToPixel_y(sw, yv));
};

SWCHART.prototype.moveToVV = function (sw, xv, yv) {
  sw.context.moveTo(sw.valueToPixel_x(sw, xv), sw.valueToPixel_y(sw, yv));
};

// line
SWCHART.prototype.lineToPP = function (sw, x, y) {
  sw.context.lineTo(sw.adjustPixel_x(sw, x), sw.adjustPixel_y(sw, y));
};
SWCHART.prototype.lineToVP = function (sw, xv, y) {
  sw.context.lineTo(sw.valueToPixel_x(sw, xv), sw.adjustPixel_y(sw, y));
};

SWCHART.prototype.lineToPV = function (sw, x, yv) {
  sw.context.lineTo(sw.adjustPixel_x(sw, x), sw.valueToPixel_y(sw, yv));
};

SWCHART.prototype.lineToVV = function (sw, xv, yv) {
  sw.context.lineTo(sw.valueToPixel_x(sw, xv), sw.valueToPixel_y(sw, yv));
};

/*
      TODO : 설정에 의해서 간격조절 가능하게?
      */
SWCHART.prototype.calc_y_grid_unit = function () {
  var ret;
  if (isNaN(this.diff_val) && this.diff_val == 0) return 10;

  if (this.diff_val > 1) {
    var t = parseInt(this.diff_val);
    var lan = t.toString().length;
    var max = 0;
    for (var i = 1; i <= lan; i++) {
      if (t < 10) {
        max = i;
        break;
      }
      t = t / 10;
    }

    // 단위를 2, 5, 10 단위로..
    if (t > 5) {
      ret = Math.pow(10, max - 1);
    } else if (t > 3) {
      ret = Math.pow(10, max - 1) / 2;
    } else {
      ret = Math.pow(10, max - 1) / 5;
    }
  } else {
    var t = this.diff_val;
    var lan = t.toString().length;
    var max = 1;
    for (var i = 1; i < lan; i++) {
      t = t * 10;
      if (t > 1) {
        max = i;
        break;
      }
    }

    // 단위를 .2, .5, 1 단위로..
    if (t > 5) {
      ret = Math.pow(10, max * -1);
    } else if (t > 3) {
      ret = Math.pow(10, max * -1) / 2;
    } else {
      ret = Math.pow(10, max * -1) / 5;
    }
  }
  return ret;
};

// 마우스 버튼 누름 감지
SWCHART.prototype.my_mousedown = function (e, sw) {
  //console.log(e);
  if (e.buttons == 1) {
    sw.down_x = e.layerX;
    sw.down_y = e.layerY;
  } else {
    sw.down_x = null;
    sw.down_y = null;
  }
};

SWCHART.prototype.my_mouseup = function (e, sw) {
  //console.log(e);
  sw.down_x = null;
  sw.down_y = null;
};

SWCHART.prototype.my_mousemove = function (e, sw) {
  if (e.buttons == 1 && sw.down_x != null) {
    var start_end_diff = sw.viewInfo.end - sw.viewInfo.start;
    var ideal_end =
      start_end_diff * (1 - sw.viewInfo.finish_rate) + sw.viewInfo.finish;
    var gap =
      ((sw.viewInfo.end - sw.viewInfo.start) * (sw.down_x - sw.cursor_x)) /
      sw.d_w;
    // gap 계산후, 이미 눌렸던 위치는 현재 위치로 변경
    sw.down_x = sw.cursor_x;
    sw.down_y = sw.cursor_y;
    if (sw.viewInfo.end + gap <= ideal_end) {
      sw.viewInfo.start += gap;
      sw.viewInfo.end += gap;
    }
  } else {
    sw.down_x = null;
    sw.down_y = null;
  }
  sw.cursor_x = e.layerX;
  sw.cursor_y = e.layerY;
};

SWCHART.prototype.my_mouseout = function (e, sw) {
  sw.cursor_x = null;
  sw.cursor_y = null;
  sw.down_x = null;
  sw.down_y = null;
};

SWCHART.prototype.my_mousewheel = function (e, sw) {
  if (e.buttons != 0) return;

  var x = sw.cursor_x;
  var diff_time = sw.viewInfo.end - sw.viewInfo.start;
  var zoom_diff_time =
    (sw.viewInfo.end - sw.viewInfo.start) * sw.viewInfo.zoom_rate; // diff_time에 감도 합산
  var left_x_time = (x * zoom_diff_time) / sw.d_w; // x좌표의 왼쪽구간
  var right_x_time = ((sw.d_w - x) * zoom_diff_time) / sw.d_w; // x좌표의 오른쪽구간

  if (
    sw.viewInfo.finish < sw.viewInfo.end &&
    sw.viewInfo.finish > sw.viewInfo.start
  ) {
    left_x_time =
      ((sw.viewInfo.finish - sw.viewInfo.start) * zoom_diff_time) / diff_time; // x좌표의 왼쪽구간
    right_x_time =
      ((sw.viewInfo.end - sw.viewInfo.finish) * zoom_diff_time) / diff_time; // x좌표의 오른쪽구간
  }

  // 커서 위치에 따른 zoomIn, zoomOut 구현
  if (e.deltaY < 0) {
    sw_zoomIn_grid(mychart);
    // 최대 zoomIn 설정
    if (diff_time < 120 * 1000) return;

    sw.viewInfo.start = sw.viewInfo.start + left_x_time;
    sw.viewInfo.end = sw.viewInfo.end - right_x_time;
  } else {
    sw_zoomOut_grid(mychart);

    // 축소시, x좌표가 finish line 앞에 있는지
    // 그냥 축소
    sw.viewInfo.start = sw.viewInfo.start - left_x_time;
    sw.viewInfo.end = sw.viewInfo.end + right_x_time;
  }
};

// @set {strokeColor, fillColor, lineWidth, alpha, font}
SWCHART.prototype.set_pen = function (setName) {
  if (!setName) return;
  if (!this.pen[setName]) return;
  if (this.pen[setName].strokeColor)
    this.context.strokeStyle = this.pen[setName].strokeColor;
  if (this.pen[setName].fillColor)
    this.context.fillStyle = this.pen[setName].fillColor;
  if (this.pen[setName].lineWidth)
    this.context.lineWidth = this.pen[setName].lineWidth;
  if (this.pen[setName].alpha)
    this.context.globalAlpha = this.pen[setName].alpha;
  if (this.pen[setName].font) this.context.font = this.pen[setName].font;
  if (this.pen[setName].textAlign)
    this.context.textAlign = this.pen[setName].textAlign;
  if (this.pen[setName].textBaseline)
    this.context.textBaseline = this.pen[setName].textBaseline;
};

SWCHART.prototype.draw_stop = function () {
  clearInterval(this.interval_handler);
  this.interval_handler = null;
};

// 차트 데이터 추가
// NOTE : timestamp는 밀리초 가 000으로 제거된 데이터 사용
function chart_data_add(chart, timestamp, value) {
  var c_data = chart.currentDataInfo;

  if (c_data.zerotime == null) {
    c_data.data.push(value);
    c_data.zerotime = timestamp;
    c_data.current = timestamp;
  } else {
    if (c_data.zerotime > timestamp) return; // 데이터 영역 밖의 과거 데이터 무시
    var t_idx = parseInt((timestamp - c_data.zerotime) / c_data.interval) - 1;

    if (t_idx >= c_data.data.length) {
      var i_max = t_idx - c_data.data.length;
      for (var i = 0; i <= i_max; i++) {
        c_data.data.push(c_data.data[c_data.data.length - 1]);
        c_data.current += c_data.interval;

        // TODO : 매번 하지 않고, 적당히 분산해서 줄이도록..
        if (c_data.data.length > c_data.range) {
          var new_data = c_data.data.slice(1);
          c_data.data = new_data;
          c_data.zerotime += c_data.interval;
        }
      }
      t_idx = c_data.data.length - 1;
    }
    c_data.data[t_idx] = value;
  }
}

// 타임스탬프 => HH:MM:SS
function sw_timeToText(time) {
  var d = new Date(time);
  return (
    (d.getHours() + 100).toString().slice(-2) +
    ":" +
    (d.getMinutes() + 100).toString().slice(-2) +
    ":" +
    (d.getSeconds() + 100).toString().slice(-2)
  );
}

// 차트 확대시 그리드 조정(zoomIn)
function sw_zoomIn_grid(sw) {
  // xGridInterval 너비 pixel 구하기
  var xGridInterval_pixel = sw.valueToPixel_x(
    sw,
    sw.viewInfo.start + mychart.xGridInterval
  );
  // x축 텍스트 너비 구하기
  var timestamp_width = sw.context.measureText(
    sw_timeToText(sw.dataInfo.current)
  ).width; // 66.038px
  // xGridInterval 너비가 x축 텍스트보다 2배이상이고, xGridInterval 15초이상 일때  그리드 너비를 15초 줄인다.
  if (
    xGridInterval_pixel > timestamp_width * 2 &&
    mychart.xGridInterval > 15000
  )
    mychart.xGridInterval -= 15000;
}

// 차트 축소시 그리드 조정(zoomOut)
function sw_zoomOut_grid(sw) {
  // xGridInterval 너비 pixel 구하기
  var xGridInterval_pixel = sw.valueToPixel_x(
    sw,
    sw.viewInfo.start + mychart.xGridInterval
  );
  // x축 텍스트 너비 구하기
  var timestamp_width = sw.context.measureText(
    sw_timeToText(sw.dataInfo.current)
  ).width; // 66.038px
  // xGridInterval 너비가 x축 텍스트 이하거나 xGridInterval 너비가 80 이하면 그리드 너비를 15초 늘린다.
  if (xGridInterval_pixel <= timestamp_width || xGridInterval_pixel < 80)
    mychart.xGridInterval += 15000;
}

function cursor_onoff() {
  mychart.viewInfo.is_cursor_line_x = !mychart.viewInfo.is_cursor_line_x;
  mychart.viewInfo.is_cursor_line_y = !mychart.viewInfo.is_cursor_line_y;
  mychart.viewInfo.is_cursor_line_value_x =
    !mychart.viewInfo.is_cursor_line_value_x;
  mychart.viewInfo.is_cursor_line_value_y =
    !mychart.viewInfo.is_cursor_line_value_y;
}

function data_fill_onoff() {
  mychart.viewInfo.is_data_area_fill = !mychart.viewInfo.is_data_area_fill;
}
