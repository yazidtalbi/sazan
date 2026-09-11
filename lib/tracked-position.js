export function getTrackedPosition(timeline, index, time) {
  const frame = Math.max(0, Math.min(timeline.frames.length - 1, (Number.isFinite(time) ? time : 0) * timeline.fps));
  const lower = Math.floor(frame);
  const upper = Math.min(lower + 1, timeline.frames.length - 1);
  const blend = frame - lower;
  const start = timeline.frames[lower][index];
  const end = timeline.frames[upper][index];
  return {
    left: `${start[0] + (end[0] - start[0]) * blend}%`,
    top: `${start[1] + (end[1] - start[1]) * blend}%`,
  };
}
