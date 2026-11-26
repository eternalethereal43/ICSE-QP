import type { GeneratedPaper, QuizQuestion } from '../types/icse';

export const SAMPLE_PHYSICS_PAPER: GeneratedPaper = {
  id: 'sample-icse-physics-40m',
  createdAt: '2026-11-26T09:00:00.000Z',
  title: 'Physics — 40 Marks Chapter Practice Paper',
  subjectId: 'physics',
  subjectName: 'Physics',
  paperSubtitle: 'SCIENCE PAPER 1 (PHYSICS)',
  paperCode: 'ICSE-PHY',
  totalMarks: 40,
  durationMinutes: 75,
  readingTimeMinutes: 15,
  difficulty: 'Mixed',
  competencyFocus: true,
  scope: 'chapters',
  chapterTitles: [
    'Force (Moments, Couple, Centre of Gravity & Uniform Circular Motion)',
    'Refraction through a Lens (Ray Diagrams, Power & Magnifying Glass)',
    'Current Electricity (Ohm’s Law, EMF, Resistance & Circuits)',
  ],
  generalInstructions: [
    'Maximum Marks: 40. Time allowed: One hour fifteen minutes.',
    'Answers to this Paper must be written on the paper provided separately.',
    'You will not be allowed to write during the first 15 minutes. This time is to be spent in reading the question paper.',
    'The time given at the head of this Paper is the time allowed for writing the answers.',
    'Section A is compulsory. Attempt any two questions from Section B. State SI units in every numerical.',
    'The intended marks for questions or parts of questions are given in brackets [ ].',
  ],
  isSample: true,
  sections: [
    {
      code: 'A',
      title: 'SECTION A',
      subtitle: 'Attempt all questions from this Section',
      marks: 20,
      isCompulsory: true,
      attemptInstruction: 'Attempt all questions from this Section.',
      questions: [
        {
          questionNumber: 'Question 1',
          chapterTag: 'Force, Lenses & Current Electricity',
          questionType: 'mcq-group',
          marks: 8,
          stem: 'Choose the correct answers to the questions from the given options. (Do not copy the question, write the correct answers only.)',
          subParts: [
            {
              label: '(i)',
              prompt: 'A uniform metre rule is pivoted at its mid-point. A weight of 50 gf is suspended at the 10 cm mark. Where must a weight of 100 gf be suspended to keep the rule horizontal?',
              marks: 1,
              options: ['(a) 60 cm mark', '(b) 70 cm mark', '(c) 80 cm mark', '(d) 90 cm mark'],
              correctOption: '(b) 70 cm mark',
              modelAnswer: '(b) 70 cm mark',
              markingSteps: [
                'Anticlockwise moment = 50 gf × (50 - 10) cm = 2000 gf·cm.',
                'Clockwise moment = 100 gf × d = 2000 gf·cm ⇒ d = 20 cm from pivot (50 + 20 = 70 cm mark).',
              ],
              examinerTip: 'Always measure distances from the fulcrum (50 cm mark), not from the zero end of the ruler.',
            },
            {
              label: '(ii)',
              prompt: 'In uniform circular motion, which physical quantity remains constant in magnitude but continuously changes in direction?',
              marks: 1,
              options: ['(a) Speed', '(b) Kinetic energy', '(c) Velocity', '(d) Angular displacement'],
              correctOption: '(c) Velocity',
              modelAnswer: '(c) Velocity',
              markingSteps: ['Speed and kinetic energy are scalars; velocity is a vector directed tangentially and changes direction continuously [1].'],
            },
            {
              label: '(iii)',
              prompt: 'A convex lens forms a virtual, erect, and magnified image of an object. The object is placed:',
              marks: 1,
              options: ['(a) At 2F', '(b) Between F and 2F', '(c) Between the optical centre and F', '(d) Beyond 2F'],
              correctOption: '(c) Between the optical centre and F',
              modelAnswer: '(c) Between the optical centre and F',
              markingSteps: ['A convex lens acts as a magnifying glass only when the object lies between the optical centre O and principal focus F₁ [1].'],
            },
            {
              label: '(iv)',
              prompt: 'The power of a lens is -2.5 D. Identify the nature and focal length of this lens.',
              marks: 1,
              options: [
                '(a) Convex lens, +40 cm',
                '(b) Concave lens, -40 cm',
                '(c) Concave lens, -25 cm',
                '(d) Convex lens, +25 cm',
              ],
              correctOption: '(b) Concave lens, -40 cm',
              modelAnswer: '(b) Concave lens, -40 cm',
              markingSteps: ['f = 1/P = 1/(-2.5) m = -0.4 m = -40 cm; negative sign confirms a diverging (concave) lens [1].'],
            },
            {
              label: '(v)',
              prompt: 'Assertion (A): A thick copper wire has less resistance than a thin copper wire of the same length. Reason (R): Resistance of a conductor is inversely proportional to its area of cross-section.',
              marks: 1,
              options: [
                '(a) Both A and R are true and R is the correct explanation of A',
                '(b) Both A and R are true but R is not the correct explanation of A',
                '(c) A is true but R is false',
                '(d) A is false but R is true',
              ],
              correctOption: '(a) Both A and R are true and R is the correct explanation of A',
              modelAnswer: '(a) Both A and R are true and R is the correct explanation of A',
              markingSteps: ['Since R = ρl/A, increasing cross-sectional area A decreases resistance R directly [1].'],
            },
            {
              label: '(vi)',
              prompt: 'Which of the following is an Ohmic resistor?',
              marks: 1,
              options: ['(a) LED', '(b) Solar cell', '(c) Constantan wire at constant temperature', '(d) Filament of a glowing bulb'],
              correctOption: '(c) Constantan wire at constant temperature',
              modelAnswer: '(c) Constantan wire at constant temperature',
              markingSteps: ['Constantan maintains constant resistance at constant temperature, giving a straight V–I graph passing through the origin [1].'],
            },
            {
              label: '(vii)',
              prompt: 'Two resistors of 6 Ω and 3 Ω are connected in parallel. Their equivalent resistance is:',
              marks: 1,
              options: ['(a) 9 Ω', '(b) 4.5 Ω', '(c) 2 Ω', '(d) 1.5 Ω'],
              correctOption: '(c) 2 Ω',
              modelAnswer: '(c) 2 Ω',
              markingSteps: ['1/Rₚ = 1/6 + 1/3 = 3/6 = 1/2 ⇒ Rₚ = 2 Ω [1].'],
            },
            {
              label: '(viii)',
              prompt: 'When a cell of EMF E and internal resistance r delivers current I to an external resistor, the terminal voltage V is:',
              marks: 1,
              options: ['(a) V = E + Ir', '(b) V = E - Ir', '(c) V = E / Ir', '(d) V = Ir - E'],
              correctOption: '(b) V = E - Ir',
              modelAnswer: '(b) V = E - Ir',
              markingSteps: ['Voltage drop across internal resistance is Ir, so terminal potential difference V = E - Ir [1].'],
            },
          ],
        },
        {
          questionNumber: 'Question 2',
          chapterTag: 'Force, Lenses & Current Electricity',
          questionType: 'short-structured',
          marks: 12,
          stem: 'Answer the following short conceptual and numerical questions briefly:',
          subParts: [
            {
              label: '(i)',
              prompt: 'Why is the steering wheel of a heavy truck made with a larger diameter than that of a small car?',
              marks: 2,
              modelAnswer:
                'A larger diameter increases the perpendicular distance (arm of the couple) between the two equal and opposite forces applied by the driver’s hands. Since Moment of Couple = Force × Couple Arm, the required turning effect is produced with much less effort.',
              markingSteps: [
                '1 mark: Larger diameter increases perpendicular distance (couple arm).',
                '1 mark: Less force is required to produce the same turning moment (τ = F × d).',
              ],
            },
            {
              label: '(ii)',
              prompt: 'Distinguish between centripetal force and centrifugal force (give two points).',
              marks: 2,
              modelAnswer:
                '1. Centripetal force is a real force directed towards the centre of the circular path, whereas centrifugal force is a fictitious/virtual force assumed to act away from the centre in a rotating frame.\n2. Centripetal force causes circular motion, whereas centrifugal force is observed only by a non-inertial observer moving along the circular path.',
              markingSteps: [
                '1 mark: Direction difference (towards centre vs. away from centre).',
                '1 mark: Real force vs. fictitious/apparent force.',
              ],
              examinerTip: 'Never write that centripetal and centrifugal forces are an action-reaction pair; ICSE deducts marks for this misconception.',
            },
            {
              label: '(iii)',
              prompt: 'An object of height 4 cm is placed at a distance of 30 cm in front of a concave lens of focal length 15 cm. Calculate the position of the image.',
              marks: 2,
              modelAnswer:
                'Given: u = -30 cm, f = -15 cm.\nUsing lens formula: 1/v - 1/u = 1/f ⇒ 1/v = 1/f + 1/u = 1/(-15) + 1/(-30) = (-2 - 1)/30 = -3/30 = -1/10.\nTherefore, v = -10 cm (10 cm in front of the lens, on the same side as the object).',
              markingSteps: [
                '1 mark: Correct sign convention (u = -30 cm, f = -15 cm) and lens formula.',
                '1 mark: Correct calculation and final answer v = -10 cm with unit.',
              ],
            },
            {
              label: '(iv)',
              prompt: 'State two factors on which the focal length of a thin lens depends.',
              marks: 2,
              modelAnswer:
                '1. The refractive index of the material of the lens relative to its surrounding medium.\n2. The radii of curvature of the two refracting surfaces of the lens.',
              markingSteps: ['1 mark each for refractive index of material/medium and radii of curvature of surfaces.'],
            },
            {
              label: '(v)',
              prompt: 'State two factors affecting the internal resistance of a cell.',
              marks: 2,
              modelAnswer:
                '1. Surface area of the electrodes dipped in the electrolyte (inversely proportional).\n2. Distance between the electrodes (directly proportional) — or temperature/concentration of the electrolyte.',
              markingSteps: ['1 mark each for any two valid ICSE syllabus factors with correct relationship.'],
            },
            {
              label: '(vi)',
              prompt: 'A wire of resistance 10 Ω is stretched to double its original length so that its volume remains constant. What is its new resistance?',
              marks: 2,
              modelAnswer:
                'When length l becomes 2l at constant volume (V = A·l), cross-sectional area becomes A/2.\nNew resistance R′ = ρ(2l) / (A/2) = 4(ρl/A) = 4R = 4 × 10 Ω = 40 Ω.',
              markingSteps: [
                '1 mark: Showing A′ = A/2 when l′ = 2l due to constant volume.',
                '1 mark: Concluding R′ = 4R = 40 Ω with Ω unit.',
              ],
            },
          ],
        },
      ],
    },
    {
      code: 'B',
      title: 'SECTION B',
      subtitle: 'Attempt any two questions from this Section',
      marks: 20,
      isCompulsory: false,
      attemptInstruction: 'Attempt any two questions from Question 3, Question 4, and Question 5 (10 marks each).',
      questions: [
        {
          questionNumber: 'Question 3',
          chapterTag: 'Force (Moments & Centre of Gravity)',
          questionType: 'long-structured',
          marks: 10,
          stem: 'Answer the following questions based on rotational equilibrium and centre of gravity:',
          subParts: [
            {
              label: '(a)',
              prompt: 'State the two conditions required for a rigid body to be in equilibrium. Give one example each of static equilibrium and dynamic equilibrium.',
              marks: 3,
              modelAnswer:
                'Conditions: (1) The resultant of all linear forces acting on the body must be zero (ΣF = 0). (2) The algebraic sum of moments of all forces about the point of rotation must be zero (Στ = 0).\nStatic equilibrium example: A book lying at rest on a table.\nDynamic equilibrium example: A raindrop falling with constant terminal velocity (or an aeroplane flying at constant height and velocity).',
              markingSteps: [
                '1 mark: Zero resultant force + zero resultant moment.',
                '1 mark: Valid static equilibrium example.',
                '1 mark: Valid dynamic equilibrium example.',
              ],
            },
            {
              label: '(b)',
              prompt: 'Define Centre of Gravity. Where does the centre of gravity lie for: (i) a hollow cone of height h, and (ii) a circular ring?',
              marks: 3,
              modelAnswer:
                'Centre of gravity is the point about which the algebraic sum of moments of weights of all particles constituting the body is zero; the entire weight of the body can be considered to act at this point.\n(i) Hollow cone: On its axis at a height h/3 from the base.\n(ii) Circular ring: At the geometric centre of the ring (outside the material of the body).',
              markingSteps: [
                '1 mark: Accurate ICSE definition of Centre of Gravity.',
                '1 mark: Hollow cone at h/3 from the base on its axis.',
                '1 mark: Circular ring at its geometric centre.',
              ],
            },
            {
              label: '(c)',
              prompt: 'A uniform half-metre rule balances horizontally on a knife edge at the 29 cm mark when a weight of 20 gf is suspended from one end. (i) Which end is the weight suspended from? (ii) Calculate the weight of the half-metre rule. (iii) In which direction will the rule tilt if the 20 gf weight is moved to the 40 cm mark?',
              marks: 4,
              modelAnswer:
                '(i) Since the rule is a half-metre rule (0 to 50 cm), its centre of gravity is at the 25 cm mark. Because the fulcrum is at 29 cm (towards the 50 cm end), the 20 gf weight must be suspended from the 50 cm end to balance the anticlockwise moment of the rule’s weight.\n(ii) Taking moments about the 29 cm mark: W × (29 - 25) = 20 × (50 - 29) ⇒ 4W = 20 × 21 = 420 ⇒ W = 105 gf.\n(iii) At the 40 cm mark, clockwise moment = 20 × (40 - 29) = 220 gf·cm, which is less than the anticlockwise moment (420 gf·cm). Hence, the rule tilts anticlockwise (towards the 0 cm end).',
              markingSteps: [
                '1 mark: Identifying CG at 25 cm and weight suspended at 50 cm end.',
                '1 mark: Setting up moment equation W × 4 = 20 × 21.',
                '1 mark: Calculating W = 105 gf.',
                '1 mark: Correctly predicting anticlockwise tilt with brief justification.',
              ],
            },
          ],
        },
        {
          questionNumber: 'Question 4',
          chapterTag: 'Refraction through a Lens',
          questionType: 'long-structured',
          marks: 10,
          stem: 'Answer the following questions based on spherical lenses and optical applications:',
          subParts: [
            {
              label: '(a)',
              prompt: 'An object is placed at a distance of 24 cm in front of a convex lens of focal length 8 cm. (i) Calculate the image distance. (ii) Calculate the linear magnification. (iii) State the nature of the image.',
              marks: 3,
              modelAnswer:
                'Given: u = -24 cm, f = +8 cm.\n(i) 1/v - 1/(-24) = 1/8 ⇒ 1/v = 1/8 - 1/24 = (3 - 1)/24 = 2/24 = 1/12 ⇒ v = +12 cm.\n(ii) Magnification m = v/u = 12 / (-24) = -0.5.\n(iii) Nature: Real, inverted, and diminished (formed on the opposite side of the lens).',
              markingSteps: [
                '1 mark: Lens formula substitution giving v = +12 cm.',
                '1 mark: Magnification m = -0.5 (sign required).',
                '1 mark: Nature — real, inverted, and diminished.',
              ],
            },
            {
              label: '(b)',
              prompt: 'Describe how you would distinguish between a convex lens and a concave lens without touching them. Mention one practical use of a concave lens.',
              marks: 3,
              modelAnswer:
                'Method: Hold the lens close to a printed page and observe the letters through it. If the letters appear magnified and upright, it is a convex lens. If the letters always appear diminished and upright regardless of distance, it is a concave lens.\nPractical use: Used in spectacles to correct myopia (short-sightedness) or as an eyepiece in a Galilean telescope.',
              markingSteps: [
                '2 marks: Clear observation test for both convex (magnified near object) and concave (always diminished).',
                '1 mark: One valid practical use (e.g., correcting myopia).',
              ],
            },
            {
              label: '(c)',
              prompt: 'A convex lens of focal length 10 cm is used as a simple microscope (magnifying glass) by a watchmaker. (i) Where should the watch part be placed relative to the lens? (ii) Describe the path of two standard rays used to locate the image. (iii) If the lower half of the lens is covered with black paper, how does it affect the size and brightness of the image?',
              marks: 4,
              modelAnswer:
                '(i) Between the optical centre O and the first principal focus F₁ (at a distance less than 10 cm from the lens).\n(ii) Ray 1 travels parallel to the principal axis and refracts through the second focus F₂. Ray 2 passes undeviated through the optical centre O. When produced backwards, these diverging rays meet on the same side as the object to form a virtual, erect, magnified image.\n(iii) The complete image of the same size is still formed because rays from every point of the object still pass through the uncovered upper half, but the intensity (brightness) of the image decreases to half.',
              markingSteps: [
                '1 mark: Object position between O and F₁ (< 10 cm).',
                '1 mark: Correct trace of two standard rays and backward extension.',
                '2 marks: Complete image of unchanged size (1m) with reduced brightness (1m).',
              ],
            },
          ],
        },
        {
          questionNumber: 'Question 5',
          chapterTag: 'Current Electricity',
          questionType: 'long-structured',
          marks: 10,
          stem: 'A cell of EMF 6 V and internal resistance 1 Ω is connected to an external circuit consisting of a 2 Ω resistor in series with a parallel combination of 6 Ω and 3 Ω resistors.',
          subParts: [
            {
              label: '(a)',
              prompt: 'Calculate: (i) the equivalent resistance of the parallel combination, and (ii) the total resistance of the entire circuit.',
              marks: 3,
              modelAnswer:
                '(i) For 6 Ω and 3 Ω in parallel: 1/Rₚ = 1/6 + 1/3 = 3/6 = 1/2 ⇒ Rₚ = 2 Ω.\n(ii) Total external resistance R_ext = 2 Ω + 2 Ω = 4 Ω.\nTotal circuit resistance R_total = R_ext + r = 4 Ω + 1 Ω = 5 Ω.',
              markingSteps: [
                '1 mark: Parallel resistance Rₚ = 2 Ω.',
                '1 mark: Adding 2 Ω series resistor to get R_ext = 4 Ω.',
                '1 mark: Adding internal resistance r = 1 Ω to get R_total = 5 Ω.',
              ],
            },
            {
              label: '(b)',
              prompt: 'Calculate: (i) the main current drawn from the cell, and (ii) the terminal potential difference across the cell.',
              marks: 3,
              modelAnswer:
                '(i) Main current I = E / R_total = 6 V / 5 Ω = 1.2 A.\n(ii) Terminal potential difference V = E - Ir = 6 - (1.2 × 1) = 4.8 V (or V = I × R_ext = 1.2 × 4 = 4.8 V).',
              markingSteps: [
                '1.5 marks: Main current I = 1.2 A with formula and unit.',
                '1.5 marks: Terminal voltage V = 4.8 V with formula and unit.',
              ],
            },
            {
              label: '(c)',
              prompt: 'Find: (i) the potential difference across the parallel combination, (ii) the current flowing through the 6 Ω resistor, and (iii) the electrical energy dissipated in the 2 Ω series resistor in 5 minutes.',
              marks: 4,
              modelAnswer:
                '(i) Potential difference across parallel combination Vₚ = I × Rₚ = 1.2 A × 2 Ω = 2.4 V.\n(ii) Current through 6 Ω resistor I₆ = Vₚ / 6 Ω = 2.4 / 6 = 0.4 A.\n(iii) Time t = 5 × 60 = 300 s.\nEnergy dissipated H = I²Rt = (1.2)² × 2 × 300 = 1.44 × 600 = 864 J.',
              markingSteps: [
                '1 mark: Vₚ = 2.4 V.',
                '1 mark: I₆ = 0.4 A.',
                '1 mark: Converting 5 minutes to 300 s and applying H = I²Rt.',
                '1 mark: Final answer H = 864 J with correct unit.',
              ],
              examinerTip: 'A very common error is leaving time in minutes instead of converting to seconds when calculating energy in Joules.',
            },
          ],
        },
      ],
    },
  ],
};

export const SAMPLE_CONCEPT_QUIZ: QuizQuestion[] = [
  {
    id: 'sample-q1',
    question: 'A spanner with a longer handle opens a rusted nut more easily because:',
    options: [
      'It increases the mass of the spanner',
      'It increases the perpendicular distance from the pivot, requiring less force for the same turning moment',
      'It reduces the friction between the threads of the nut',
      'It converts linear momentum into kinetic energy',
    ],
    correctIndex: 1,
    explanation:
      'Moment of force (torque) is τ = F × d. By increasing the perpendicular distance d from the axis of rotation, the same required turning effect τ can be achieved by applying a much smaller force F.',
    conceptTag: 'Moment of Force',
    commonMistake: 'Students sometimes say a longer handle "increases force" instead of saying it produces the same turning moment with a smaller applied force.',
    icseMarksHint: 'Typical 1–2 mark Give Reason question in Section A',
  },
  {
    id: 'sample-q2',
    question: 'In uniform circular motion of a stone tied to a string, the work done by the centripetal force in one complete revolution is:',
    options: ['Maximum positive', 'Negative', 'Zero', 'Equal to 2πr × F'],
    correctIndex: 2,
    explanation:
      'At every instant, the centripetal force acts radially towards the centre while the instantaneous displacement is along the tangent. Since the angle between force and displacement is 90° (cos 90° = 0), work done W = F·s·cos 90° = 0.',
    conceptTag: 'Uniform Circular Motion',
    commonMistake: 'Multiplying F by circumference 2πr ignores the 90° angle between centripetal force and tangential displacement.',
    icseMarksHint: 'High-frequency ICSE competency MCQ',
  },
  {
    id: 'sample-q3',
    question: 'Where does the centre of gravity of a solid cone of height h lie?',
    options: [
      'At a height h/2 from the base on its axis',
      'At a height h/3 from the base on its axis',
      'At a height h/4 from the base on its axis',
      'At the apex of the cone',
    ],
    correctIndex: 2,
    explanation:
      'For a solid cone, more mass is concentrated near the base, placing the centre of gravity at h/4 from the base along its axis. By contrast, a hollow cone has its centre of gravity at h/3 from the base.',
    conceptTag: 'Centre of Gravity',
    commonMistake: 'Confusing solid cone (h/4 from base) with hollow cone (h/3 from base).',
    icseMarksHint: 'Classic 1-mark Section A recall & contrast question',
  },
  {
    id: 'sample-q4',
    question: 'For a body in rotational equilibrium under multiple coplanar forces, the Principle of Moments states that:',
    options: [
      'Sum of upward forces equals sum of clockwise moments',
      'Sum of anticlockwise moments equals sum of clockwise moments about the pivot',
      'All forces must pass through the centre of gravity',
      'The mass on both sides of the pivot must be equal',
    ],
    correctIndex: 1,
    explanation:
      'According to the Principle of Moments, when a body is in equilibrium, the algebraic sum of moments about the axis of rotation is zero — meaning Sum of Anticlockwise Moments = Sum of Clockwise Moments.',
    conceptTag: 'Principle of Moments',
    commonMistake: 'Assuming equal masses are needed on both sides — unequal weights balance whenever F₁d₁ = F₂d₂.',
    icseMarksHint: 'Core law tested in Section B ruler numericals',
  },
];
