# PRACTICE FIELD 14-DAY PILOT SPEC

Date: 2026-05-03  
Status: Internal pilot spec. Hidden from public navigation and deploy surface until payment proof is complete.  
Owner: Product + Content + Ops  
Tech owner: Team Dev after payment proof

## 1. Goal

Run a quiet 14-day pilot for 10-20 people to test whether small practices, avoidance-aware check-ins, and human reflection improve retention without coercive reminders.

This pilot is not a public launch, not a community launch, and not a growth campaign. It is a truth test.

## 2. Hypothesis

People do not stop practicing only because reminders are weak. They stop because practice touches feeling, ego, shame, resistance, or body-level discomfort.

If the system allows them to name avoidance without shame and take one smaller step, more people will return by Day 7 and Day 14 than in a standard reminder/checklist flow.

## 3. Participants

Pilot size:

- minimum: 10 people
- maximum: 20 people

Two entry groups:

### Gentle Rhythm

For people who:

- avoid structured practice
- dislike pressure
- stop when email reminders feel like obligation
- need a small safe step

### Deep Facing

For people who:

- are ready to meet emotional roots
- can name ego reactions
- want stronger prompts
- can receive human reflection without turning it into performance

## 4. Daily Structure

Every day contains:

- one insight
- one 5-10 minute practice
- one check-in state
- one honest line

Valid check-in states:

- did the practice
- did one smaller step
- avoiding
- needs human reflection

## 5. Human Touchpoints

Human interaction is light but real:

- Day 1: welcome and track confirmation
- Day 3: detect early avoidance
- Day 7: short review
- Day 14: closing reflection and next-step recommendation

The pilot does not need daily human replies for every person. It needs enough human presence that members do not feel they are practicing into a void.

## 6. Reminder Rules

Participants choose:

- no reminders
- gentle reminder
- rhythm reminder with one 5-minute step

Every reminder must include a 7-day pause option.

Forbidden reminder tones:

- guilt
- urgency pressure
- "you are falling behind"
- spiritual superiority
- shame for not completing

## 7. Pilot Content Arc

Day 1:

- Theme: one honest line
- Practice: write what is true now
- Check-in: done / smaller step / avoiding / human reflection

Day 2:

- Theme: body and space
- Practice: one 5-10 minute action in the body or living space

Day 3:

- Theme: first avoidance point
- Practice: name what you are avoiding
- Human touchpoint: review people who choose `avoiding` or `human_reflection`

Day 4:

- Theme: one object
- Practice: choose one object and notice the emotional charge around it

Day 5:

- Theme: rhythm without force
- Practice: repeat one small step, smaller than the mind wants

Day 6:

- Theme: the loop
- Practice: name one repeating pattern

Day 7:

- Theme: weekly review
- Practice: choose one sentence: "I keep avoiding..."
- Human touchpoint: short review

Day 8:

- Theme: the next smaller step
- Practice: reduce the action until it feels doable

Day 9:

- Theme: creative labor
- Practice: make or repair something small

Day 10:

- Theme: sound-self
- Practice: one minute of voice, humming, breath, or silence

Day 11:

- Theme: relationship with space
- Practice: clean or arrange one small area

Day 12:

- Theme: direct facing
- Practice: write what the ego does not want to admit

Day 13:

- Theme: continuing without drama
- Practice: choose one rhythm you can keep

Day 14:

- Theme: closing reflection
- Practice: write one avoidance point, one real action, and one next commitment
- Human touchpoint: next-step recommendation

## 8. Metrics

Primary:

- Day 7 return rate
- Day 14 completion rate
- avoidance naming rate
- human reflection requests
- voluntary continuation rate

Secondary:

- payment conversion
- email open rate
- checkout completion
- number of check-ins

## 9. Success Threshold

Move to quiet-circle build only if:

- at least 50% return on Day 7
- at least 30% complete Day 14
- at least 40% can name one avoidance point
- at least 5 real human-reflection requests are handled

If thresholds are not met, do not add more features. Reduce friction and shorten the practices.

## 10. What Not To Build During Pilot

- public feed
- likes
- leaderboard
- broad community
- certification
- creator revenue share UI
- AI-only emotional advice
- more than two tracks

## 11. Dev Notes

The pilot can begin with simple static/member UI and local/D1 logging. Do not block payment proof. Do not alter PayPal/VietQR/Stripe paths for this pilot.

Minimum product fields needed later:

- `practiceTrack`: `gentle` or `deep`
- `reminderIntensity`: `none`, `gentle`, or `rhythm`
- `practiceState`: `done`, `smaller_step`, `avoiding`, or `human_reflection`
- `oneLine`
- `needsHumanReflection`
- `createdAt`

