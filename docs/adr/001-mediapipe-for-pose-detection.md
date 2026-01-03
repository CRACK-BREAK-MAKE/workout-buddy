# ADR-001: Use MediaPipe Pose for Exercise Detection

**Status:** Accepted

**Date:** 2026-01-02

**Decision Makers:** Technical Lead, ML Engineer

## Context and Problem Statement

We need a reliable, accurate, and performant pose detection solution for counting exercises. The solution must work in real-time on standard webcams without requiring specialized hardware or expensive cloud ML APIs.

## Decision Drivers

* Must achieve >95% accuracy for exercise counting
* Must work in real-time (30+ FPS) on standard hardware
* Must minimize infrastructure costs (MVP budget: $0-50/month)
* Must preserve user privacy (no video uploads to servers)
* Must work on standard webcams without specialized equipment
* Should support multiple exercise types (push-ups, jump rope, squats)

## Considered Options

1. **MediaPipe Pose (Google)** - Pre-trained pose detection running in browser
2. **TensorFlow.js with PoseNet** - Custom model training required
3. **OpenCV.js + Custom ML Model** - More control but higher complexity
4. **Cloud-based APIs (AWS Rekognition, Azure Custom Vision)** - Requires internet, ongoing costs

## Decision

Use **MediaPipe Pose JavaScript library** (@mediapipe/tasks-vision)

## Rationale

* **No Backend ML Processing:** Runs entirely in browser, reduces infrastructure costs to $0
* **Proven Accuracy:** 97.5% accuracy for exercise counting (research-validated)
* **Performance:** 30+ FPS on standard webcams, ~55ms per frame processing time
* **Free & No API Costs:** No per-request charges or monthly fees
* **Privacy-Preserving:** All processing local, no video data sent to servers (GDPR compliant)
* **33 Body Landmarks:** Sufficient detail for push-ups, jump rope, squats, and more
* **Active Maintenance:** Google-supported with regular updates
* **Browser Native:** Works directly in JavaScript without backend dependencies

## Consequences

### Positive

* Zero ML infrastructure costs in MVP phase
* Instant real-time feedback (<100ms latency end-to-end)
* Works offline after initial page load
* Privacy-preserving (GDPR/CCPA compliant out of the box)
* Easy to integrate with React (hooks-based approach)
* Scalable to millions of users (processing on client)

### Negative

* Limited to what MediaPipe can detect (no custom exercises initially)
* Requires modern browser (Chrome/Edge recommended, limited Safari support)
* Client-side processing may drain battery on mobile devices
* Limited to single-person detection (cannot count multiple people)
* Dependent on Google's continued support

### Neutral

* Requires ~50MB download for model files on first load (cached after)
* GPU acceleration recommended but not required

## Mitigation Strategies

**Browser compatibility risk:**
* Clearly document browser requirements (Chrome 90+, Edge 90+)
* Show user-friendly error for unsupported browsers
* Provide fallback instructions

**Battery drain on mobile:**
* Optimize JavaScript for battery efficiency (throttle FPS if needed)
* Add "power saving mode" option
* Warn users about battery impact

**Custom exercise limitations:**
* Plan for custom model training in Phase 3+ if needed
* Document process for adding new exercise types
* Consider TensorFlow.js as fallback for custom exercises

## Validation

**Success Criteria:**

* Achieve >95% rep counting accuracy in user testing
* Maintain 30 FPS on mid-range devices (3-year-old laptops)
* Zero infrastructure costs for ML processing
* Support at least 2 exercise types in MVP (push-ups, jump rope)

**Measured Results** (after implementation):
* TBD - Will be measured in user testing phase

## Confidence Level

**High** (9/10)

MediaPipe is production-proven and used by fitness apps with millions of users. Risk is minimal because we can always switch to TensorFlow.js if MediaPipe proves inadequate, though this is unlikely given its track record.

## Related Decisions

* Related to [ADR-002](002-react-vite-frontend.md) - React integration approach
* Informs [ADR-010](010-feature-based-structure.md) - Exercise counting feature structure

## References

* [MediaPipe Pose Documentation](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
* [MediaPipe JavaScript API](https://www.npmjs.com/package/@mediapipe/tasks-vision)
* [Research paper on MediaPipe accuracy](https://arxiv.org/abs/2006.10204)
* [Browser compatibility](https://caniuse.com/webgl2)
