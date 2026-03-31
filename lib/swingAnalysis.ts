'use client';

export type SwingMetrics = {
  shoulderHipSeparation: number | null;
  wristAngle: number | null;
  finishBalance: number | null;
  insights: string[];
  rawLandmarks?: any[];
};

/**
 * Angle between three points (in degrees)
 */
function angleBetweenPoints(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);
  if (magAB === 0 || magCB === 0) return 0;
  return (Math.acos(Math.max(-1, Math.min(1, dot / (magAB * magCB)))) * 180) / Math.PI;
}

/**
 * Extract swing metrics from a set of pose landmark frames.
 * Each frame is an array of 33 MediaPipe Pose landmarks.
 * We sample across frames to find impact-ish moment (wrist lowest point).
 */
export function computeSwingMetrics(allFrameLandmarks: any[][]): SwingMetrics {
  if (!allFrameLandmarks || allFrameLandmarks.length === 0) {
    return { shoulderHipSeparation: null, wristAngle: null, finishBalance: null, insights: ['No pose data detected.'] };
  }

  // MediaPipe Pose landmark indices
  const LEFT_SHOULDER = 11, RIGHT_SHOULDER = 12;
  const LEFT_HIP = 23, RIGHT_HIP = 24;
  const LEFT_WRIST = 15, RIGHT_WRIST = 16;
  const LEFT_ELBOW = 13, RIGHT_ELBOW = 14;
  const LEFT_ANKLE = 27, RIGHT_ANKLE = 28;
  const NOSE = 0;

  // ---- 1. Shoulder-Hip Separation (X-factor) ----
  // Computed at the frame where lead wrist is lowest (approximate impact)
  let impactFrameIdx = 0;
  let minWristY = Infinity;
  allFrameLandmarks.forEach((frame, i) => {
    if (!frame) return;
    const lw = frame[LEFT_WRIST];
    if (lw && lw.y < minWristY) { // In MediaPipe, y=0 is top
      // We want the lowest point: max y value actually
    }
  });
  // Find frame with highest wrist Y (lowest on screen = impact zone)
  allFrameLandmarks.forEach((frame, i) => {
    if (!frame) return;
    const lw = frame[LEFT_WRIST];
    if (lw && lw.y > minWristY) {
      minWristY = lw.y;
      impactFrameIdx = i;
    }
  });
  // fallback: use middle frame
  if (minWristY === Infinity) impactFrameIdx = Math.floor(allFrameLandmarks.length / 2);

  const impactFrame = allFrameLandmarks[impactFrameIdx];
  let shoulderHipSeparation: number | null = null;

  if (impactFrame) {
    const ls = impactFrame[LEFT_SHOULDER];
    const rs = impactFrame[RIGHT_SHOULDER];
    const lh = impactFrame[LEFT_HIP];
    const rh = impactFrame[RIGHT_HIP];
    if (ls && rs && lh && rh) {
      // Shoulder midpoint angle vs hip midpoint angle relative to vertical
      const shoulderMid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
      const hipMid = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
      // shoulder line angle
      const shoulderAngle = Math.atan2(rs.y - ls.y, rs.x - ls.x) * (180 / Math.PI);
      const hipAngle = Math.atan2(rh.y - lh.y, rh.x - lh.x) * (180 / Math.PI);
      shoulderHipSeparation = Math.abs(shoulderAngle - hipAngle);
      // Clamp to reasonable range
      shoulderHipSeparation = Math.min(shoulderHipSeparation, 90);
    }
  }

  // ---- 2. Wrist Angle at Impact ----
  let wristAngle: number | null = null;
  if (impactFrame) {
    const ls = impactFrame[LEFT_SHOULDER];
    const le = impactFrame[LEFT_ELBOW];
    const lw = impactFrame[LEFT_WRIST];
    if (ls && le && lw) {
      wristAngle = angleBetweenPoints(ls, le, lw);
    }
  }

  // ---- 3. Finish Balance ----
  // Use the last ~10% of frames to assess final body tilt
  let finishBalance: number | null = null;
  const finishFrames = allFrameLandmarks.slice(Math.floor(allFrameLandmarks.length * 0.85));
  const validFinishFrames = finishFrames.filter(f => f && f[LEFT_SHOULDER] && f[RIGHT_SHOULDER] && f[LEFT_ANKLE] && f[RIGHT_ANKLE]);
  if (validFinishFrames.length > 0) {
    const avgTilt = validFinishFrames.reduce((sum, frame) => {
      const ls = frame[LEFT_SHOULDER];
      const rs = frame[RIGHT_SHOULDER];
      const la = frame[LEFT_ANKLE];
      const ra = frame[RIGHT_ANKLE];
      const shoulderMidX = (ls.x + rs.x) / 2;
      const ankleMidX = (la.x + ra.x) / 2;
      return sum + Math.abs(shoulderMidX - ankleMidX);
    }, 0) / validFinishFrames.length;
    // Convert to a 0-100 score: lower lateral sway = better balance
    finishBalance = Math.max(0, Math.min(100, Math.round((1 - avgTilt * 4) * 100)));
  }

  // ---- Generate Plain English Insights ----
  const insights: string[] = [];

  if (shoulderHipSeparation !== null) {
    if (shoulderHipSeparation > 35) {
      insights.push(`Good X-factor: ${Math.round(shoulderHipSeparation)}° shoulder-hip separation. You're generating good rotational coil.`);
    } else if (shoulderHipSeparation > 20) {
      insights.push(`Moderate X-factor: ${Math.round(shoulderHipSeparation)}° shoulder-hip separation. Try to increase hip resistance on the backswing for more power.`);
    } else {
      insights.push(`Limited X-factor: ${Math.round(shoulderHipSeparation)}° shoulder-hip separation. Hip rotation may be too restrictive or shoulders aren't fully coiling. Focus on turning shoulders while keeping hips quieter.`);
    }
  }

  if (wristAngle !== null) {
    if (wristAngle > 150) {
      insights.push(`Wrist angle at impact looks extended (${Math.round(wristAngle)}°). Arms appear to be in good extension through the ball.`);
    } else if (wristAngle > 120) {
      insights.push(`Wrist angle at impact: ${Math.round(wristAngle)}°. Slightly bent — check if you're holding off the release. Try to maintain extension through impact.`);
    } else {
      insights.push(`Wrist angle is quite bent at impact (${Math.round(wristAngle)}°). This could indicate early release or "casting". Work on maintaining wrist angle through the downswing.`);
    }
  }

  if (finishBalance !== null) {
    if (finishBalance >= 75) {
      insights.push(`Finish balance looks solid (${finishBalance}/100). You're finishing in a stable, controlled position.`);
    } else if (finishBalance >= 50) {
      insights.push(`Finish balance is moderate (${finishBalance}/100). There's some lateral sway detected. Try to finish with weight fully on your lead foot.`);
    } else {
      insights.push(`Finish balance needs work (${finishBalance}/100). Significant body sway detected at finish. Focus on keeping your spine angle stable and finishing tall over your lead side.`);
    }
  }

  if (insights.length === 0) {
    insights.push('Pose detection ran but could not extract enough landmark data. Ensure the full body is visible in the video.');
  }

  return {
    shoulderHipSeparation: shoulderHipSeparation !== null ? Math.round(shoulderHipSeparation) : null,
    wristAngle: wristAngle !== null ? Math.round(wristAngle) : null,
    finishBalance,
    insights,
  };
}

/**
 * Run MediaPipe Pose on a video element, collecting landmarks per frame.
 * Returns array of landmark arrays (one per sampled frame).
 */
export async function analyzeVideoWithPose(
  videoEl: HTMLVideoElement,
  onProgress?: (pct: number) => void
): Promise<any[][]> {
  return new Promise(async (resolve, reject) => {
    try {
      // @ts-ignore – MediaPipe loaded via CDN script tag
      const { Pose } = await import('@mediapipe/pose');

      const allLandmarks: any[][] = [];
      const sampleRate = 5; // process every 5th frame
      let frameCount = 0;

      const pose = new Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results: any) => {
        if (results.poseLandmarks) {
          allLandmarks.push(results.poseLandmarks);
        } else {
          allLandmarks.push([]);
        }
      });

      await pose.initialize();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 640;
      canvas.height = 360;

      const duration = videoEl.duration;
      const totalSamples = Math.floor(duration / (1 / 30) / sampleRate);

      const processFrame = async (time: number): Promise<void> => {
        return new Promise((res) => {
          videoEl.currentTime = time;
          videoEl.onseeked = async () => {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            await pose.send({ image: canvas });
            res();
          };
        });
      };

      const frameTimes: number[] = [];
      for (let t = 0; t < duration; t += sampleRate / 30) {
        frameTimes.push(t);
      }

      for (let i = 0; i < frameTimes.length; i++) {
        await processFrame(frameTimes[i]);
        if (onProgress) onProgress(Math.round((i / frameTimes.length) * 100));
      }

      pose.close();
      resolve(allLandmarks);
    } catch (err) {
      reject(err);
    }
  });
}
