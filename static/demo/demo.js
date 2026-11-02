// Demonstration of Errors data.
// Original cases: ArticulateMetrics scripts/generate_error_cases.py.
// Labeled renders and the negative-270-degree case: 2026-11-02 server package.
//   file  = filename inside static/demo/ (mp4 clip, or gif for the old renderer)
//   poster = still shown before the clip plays                 (mp4 only)
//   title = card heading
//   gt    = the correct (ground-truth) parameter value        (optional)
//   wrong = the wrong parameter value shown in the gif         (optional)
//   error = E_alpha between gt and wrong (split norm, alpha=1) (optional)
window.DEMO_ERROR_ITEMS = [
  {
    file: "labeled/GT_motion.mp4",
    title: "Ground Truth",
    poster: "labeled/GT_poster.png",
    error: "0.00"
  },
  {
    file: "labeled/mobility_0_type_motion.mp4",
    title: "Joint 0 Type Error",
    poster: "labeled/mobility_0_type_poster.png",
    gt: "joint type: prismatic",
    wrong: "joint type: revolute",
    error: "1.150"
  },
  {
    file: "labeled/mobility_0_axis_motion.mp4",
    title: "Joint 0 Axis Error",
    poster: "labeled/mobility_0_axis_poster.png",
    gt: "joint axis: [0 0 1]",
    wrong: "joint axis: [-1 0 0]",
    error: "1.075"
  },
  {
    file: "labeled/mobility_0_origin_motion.mp4",
    title: "Joint 0 Origin Error",
    poster: "labeled/mobility_0_origin_poster.png",
    gt: "joint origin: [-0.0141503 0.537587 0.492051]",
    wrong: "joint origin: [-0.0141503 1.53759 0.492051]",
    error: "0.000"
  },
  {
    file: "labeled/mobility_0_limit_motion.mp4",
    title: "Joint 0 Limit Error",
    poster: "labeled/mobility_0_limit_poster.png",
    gt: "joint limit: 0 - 0.76",
    wrong: "joint limit: -0.76 - 0",
    error: "1.075"
  },
  {
    file: "labeled/mobility_0_limit2_motion.mp4",
    title: "Joint 0 Limit Error 2",
    poster: "labeled/mobility_0_limit2_poster.png",
    gt: "joint limit: 0 - 0.76",
    wrong: "joint limit: 0 - 1.14",
    error: "0.380"
  },
  {
    file: "labeled/mobility_1_type_motion.mp4",
    title: "Joint 1 Type Error",
    poster: "labeled/mobility_1_type_poster.png",
    gt: "joint type: revolute",
    wrong: "joint type: prismatic",
    error: "2.418"
  },
  {
    file: "labeled/mobility_1_axis_motion.mp4",
    title: "Joint 1 Axis Error",
    poster: "labeled/mobility_1_axis_poster.png",
    gt: "joint axis: [0 -1 0]",
    wrong: "joint axis: [-1 0 0]",
    error: "2.703"
  },
  {
    file: "labeled/mobility_1_axis_neg_motion.mp4",
    title: "Joint 1 Negated Axis Error",
    poster: "labeled/mobility_1_axis_neg_poster.png",
    gt: "joint axis: [0 -1 0]",
    wrong: "joint axis: [0 1 0]",
    error: "2.600"
  },
  {
    file: "labeled/mobility_1_origin_motion.mp4",
    title: "Joint 1 Origin Error",
    poster: "labeled/mobility_1_origin_poster.png",
    gt: "joint origin: [-0.357699 -0.590594 0.491555]",
    wrong: "joint origin: [-0.357699 -0.590594 1.49156]",
    error: "1.571"
  },
  {
    file: "labeled/mobility_1_limit_motion.mp4",
    title: "Joint 1 Limit Error",
    poster: "labeled/mobility_1_limit_poster.png",
    gt: "joint limit: 0 - 1.5708",
    wrong: "joint limit: -1.5708 - 0",
    error: "2.600"
  },
  {
    file: "labeled/mobility_1_limit2_motion.mp4",
    title: "Joint 1 Limit Error 2",
    poster: "labeled/mobility_1_limit2_poster.png",
    gt: "joint limit: 0 - 1.5708",
    wrong: "joint limit: 0 - 2.35619",
    error: "0.919"
  },
  {
    file: "labeled/mobility_1_axis_limit_motion.mp4",
    title: "Joint 1 Axis + Limit Error",
    poster: "labeled/mobility_1_axis_limit_poster.png",
    gt: "axis [0 -1 0], limit 0 - 1.5708",
    wrong: "axis [0 1 0], limit -1.5708 - 0",
    error: "0.000"
  },
  {
    file: "labeled/mobility_1_limit_neg270_motion.mp4",
    title: "Joint 1 Limit Error: −270°",
    poster: "labeled/mobility_1_limit_neg270_poster.png",
    gt: "0° to +90°",
    wrong: "0° to −270°",
    error: "5.813"
  },
  {
    file: "labeled/mobility_2_prismatic_motion.mp4",
    title: "Joint 2 Fixed as Prismatic",
    poster: "labeled/mobility_2_prismatic_poster.png",
    gt: "joint type: fixed",
    wrong: "joint type: prismatic (limit 0 - 0.001)",
    error: "0.001"
  },
  {
    file: "labeled/mobility_2_revolute_motion.mp4",
    title: "Joint 2 Fixed as Revolute",
    poster: "labeled/mobility_2_revolute_poster.png",
    gt: "joint type: fixed",
    wrong: "joint type: revolute (limit 0 - 0.001)",
    error: "0.001"
  }
];
