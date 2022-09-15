window.onload = function () {
  test_chart_init();
};

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

function make_sample() {
  if (!is_sampling) return;

  sample_value = parseFloat(makeSampleData(sample_value)).toFixed(3);
  sample_timestamp += 1000;

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
var mychart = null;

function test_chart_init() {
  mychart = new CHART("canvas");
  var c_data = mychart.currentDataInfo;
  var c_view = mychart.viewInfo;

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

function CHART(holderId) {
  this.pen = {};
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
  this.currentDataInfo = null;

  // 기본데이터 정보 생성
  this.dataInfo = {
    line: {
      interval: 1000,
      zerotime: null,
      current: null,
      data: [],
      range: 3600,
      nd: 3,
    },
  };

  // 기본 데이터 정보
  this.currentDataInfo = this.dataInfo.line;

  // 출력 정보
  this.viewInfo = {};
  this.viewInfo.geometry = {};
  this.viewInfo.geometry.margin = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  };
  this.viewInfo.geometry.cursorLineValueBox = { width: 80, height: 20 };
  this.viewInfo.start = null;
  this.viewInfo.end = null;
  this.viewInfo.min = 0;
  this.viewInfo.max = 0;
  this.viewInfo.finish_rate = 0.875;
  this.viewInfo.finish = null;
  this.viewInfo.gridYCountMax = 20;
  this.viewInfo.gridYCountMin = 5;
  this.viewInfo.minmax_padding_rate = 0.2; // 최대값 상하에 추가할 패딩 영역 크기
  this.viewInfo.term = 1;

  this.canvas = document.getElementById(holderId);
  this.context = this.canvas.getContext("2d");

  // 현재 시세 포인터
  this.pointer_interval = 30;
  this.pointer_min_radius = 5;

  // 애니메이션 프레임 관련 정보
  this.fps = 60;
  this.interval_handler = null;
  this.interval = 1000 / this.fps;
  this.frame_counter = 0;
  this.start_time = null; // 마지막 노드 추가시간
  this.animation_duration = 400;
  this.xGridInterval = 15000;

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

  // x축 횡이동
  this.x_duration = 300;
  this.x_start_time = 0;
  this.x_from = 0;
  this.x_to = 0;

  // y축
  this.y_duration = 300;
  this.y_start_time = 0;
  this.y_min_from = 0;
  this.y_min_to = 0;
  this.y_max_from = 0;
  this.y_max_to = 0;

  return this;
}

CHART.prototype.move_y = function (to_min, to_max) {
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
  this.y_start_time = new Date().getTime();
};

CHART.prototype.move_x = function (to) {
  this.x_from = this.viewInfo.start;
  this.x_to = this.x_from + to;
  this.x_start_time = new Date().getTime();
};

// 지정된 시간과 마감 간격을 기준으로, 바이너리 옵션의 투자 마감 시간을 산출한다.
CHART.prototype.calc_finish_time = function (baseTime, term = 1) {
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

CHART.prototype.draw_call = function () {
  if (this.interval_handler != null) return;

  // 시작 시간 보관
  this.frame_counter = 0;
  this.start_time = new Date().getTime();

  this.interval_handler = setInterval(this.draw, this.interval, this);
};

CHART.prototype.draw = function (sw) {
  if (sw == undefined || sw == null) sw = this;

  var ctx = sw.context;
  var cvs = sw.canvas;
  var margin = sw.viewInfo.geometry.margin;
  var dataInfo = sw.currentDataInfo;
  var viewInfo = sw.viewInfo;

  sw.c_time = new Date().getTime();
  var diff_time = sw.c_time - sw.start_time;
  if (sw.start_time == 0) {
    diff_time = 0;
  }

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

  // X axis, grid 세로선
  ctx.save();

  sw.set_pen("grid_x");
  ctx.beginPath();

  var xGridInterval = sw.xGridInterval;
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

  // 데이터
  sw.draw_data(animationStep);

  // 결정구간 표시
  sw.draw_determine_area();

  // 현재 시세 포인터 배경
  sw.draw_current_value_pointer();

  ctx.restore();
};

//// 드로잉 함수 분할
CHART.prototype.draw_data = function (animationStep) {
  this.context.save();
  this.set_pen("line");

  var start_index_time;
  var x_distance;
  var y_distance;

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

CHART.prototype.draw_current_value_pointer = function () {
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

  this.context.fillStyle = "rgba(255, 255, 0, 0.4)";
  this.context.beginPath();
  this.context.arc(p_x, p_y, pointer_radius, 0, 2 * Math.PI);
  this.context.fill();
};

CHART.prototype.draw_determine_area = function () {
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
  this.moveToVP(this, this.viewInfo.finish - 30000, 0);
  this.lineToVP(this, this.viewInfo.finish, 0);
  this.lineToVP(this, this.viewInfo.finish, this.d_h);
  this.lineToVP(this, this.viewInfo.finish - 30000, this.d_h);
  this.context.closePath();
  this.context.fill();
};

CHART.prototype.calc_min_max = function () {
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
CHART.prototype.pixelToValue_x = function (sw, x) {
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

CHART.prototype.pixelToValue_y = function (sw, y) {
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

CHART.prototype.adjustPixel_x = function (sw, x) {
  return x + sw.viewInfo.geometry.margin.left;
};

CHART.prototype.adjustPixel_y = function (sw, y) {
  return sw.canvas.height - sw.viewInfo.geometry.margin.bottom - y;
};

CHART.prototype.valueToPixel_x = function (sw, xv) {
  var x =
    ((sw.canvas.width -
      sw.viewInfo.geometry.margin.left -
      sw.viewInfo.geometry.margin.right) *
      (xv - sw.viewInfo.start)) /
    (sw.viewInfo.end - sw.viewInfo.start);

  return sw.adjustPixel_x(sw, x);
};

CHART.prototype.valueToPixel_y = function (sw, yv) {
  var y =
    ((sw.canvas.height -
      sw.viewInfo.geometry.margin.bottom -
      sw.viewInfo.geometry.margin.top) /
      sw.diff_val) *
    (yv - sw.grid_min);
  return sw.adjustPixel_y(sw, y);
};

// move
CHART.prototype.moveToPP = function (sw, x, y) {
  sw.context.moveTo(sw.adjustPixel_x(sw, x), sw.adjustPixel_y(sw, y));
};
CHART.prototype.moveToVP = function (sw, xv, y) {
  sw.context.moveTo(sw.valueToPixel_x(sw, xv), sw.adjustPixel_y(sw, y));
};

CHART.prototype.moveToPV = function (sw, x, yv) {
  sw.context.moveTo(sw.adjustPixel_x(sw, x), sw.valueToPixel_y(sw, yv));
};

CHART.prototype.moveToVV = function (sw, xv, yv) {
  sw.context.moveTo(sw.valueToPixel_x(sw, xv), sw.valueToPixel_y(sw, yv));
};

// line
CHART.prototype.lineToPP = function (sw, x, y) {
  sw.context.lineTo(sw.adjustPixel_x(sw, x), sw.adjustPixel_y(sw, y));
};
CHART.prototype.lineToVP = function (sw, xv, y) {
  sw.context.lineTo(sw.valueToPixel_x(sw, xv), sw.adjustPixel_y(sw, y));
};

CHART.prototype.lineToPV = function (sw, x, yv) {
  sw.context.lineTo(sw.adjustPixel_x(sw, x), sw.valueToPixel_y(sw, yv));
};

CHART.prototype.lineToVV = function (sw, xv, yv) {
  sw.context.lineTo(sw.valueToPixel_x(sw, xv), sw.valueToPixel_y(sw, yv));
};

CHART.prototype.calc_y_grid_unit = function () {
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

// @set {strokeColor, fillColor, lineWidth, alpha, font}
CHART.prototype.set_pen = function (setName) {
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

// 차트 데이터 추가
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
