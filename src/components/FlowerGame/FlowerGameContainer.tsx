import { useEffect, useState } from "react";
import type * as React from "react";
import { FirstHalfQuestions } from "./FirstHalfQuestions";
import { SecondHalfQuestions } from "./SecondHalfQuestions";
import { ResultPage } from "./ResultPage";
import type { GifScene } from "./FirstHalfQuestions";

interface Props {
  serializedState: string | undefined;
  scenes: GifScene[][];
}

class InvalidStateError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

// sensory = body, harmony = heart, charity = head
export type FlowerGroup = "sensory" | "harmony" | "charity";
export type FlowerType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// sorted by least to most points
const FLOWER_TYPES: Record<FlowerGroup, FlowerType[]> = {
  sensory: [1, 9, 8],
  harmony: [4, 3, 2],
  charity: [7, 6, 5],
} as const;

interface SerializableGameState {
  firstHalfScore: number;
  secondHalfScore: number;
  questionNumber: number;
}

export const GAME_STATE_COOKIE_KEY = "game_state";

export const FlowerGameContainer: React.FC<Props> = ({
  serializedState,
  scenes,
}) => {
  try {
    return FlowerGame({ serializedState, scenes });
  } catch (err) {
    if (err instanceof InvalidStateError) {
      console.log("Invalid game state: " + err.message);
      // clear the state if the saved state is invalid
      return FlowerGame({ serializedState: undefined, scenes });
    } else {
      throw err;
    }
  }
};

const FlowerGame: React.FC<Props> = ({ serializedState, scenes }) => {
  let storedState: SerializableGameState | undefined = undefined;
  if (serializedState !== undefined)
    storedState = JSON.parse(serializedState) as SerializableGameState;

  if (
    storedState !== undefined &&
    storedState.questionNumber !== 1 &&
    storedState.questionNumber <= 10
  ) {
    throw new InvalidStateError("Unfinished game");
  }

  const [questionNumber, setQuestionNumber] = useState(
    storedState?.questionNumber ?? 1,
  );
  const [firstHalfScore, setFirstHalfScore] = useState(
    storedState?.firstHalfScore ?? 0,
  );
  const [secondHalfScore, setSecondHalfScore] = useState(
    storedState?.secondHalfScore ?? 0,
  );
  const group: FlowerGroup | undefined = determineGroup();
  const flowerType: FlowerType | undefined = determineFlowerType();

  const [restarted, setRestarted] = useState(false);

  function determineGroup(): FlowerGroup | undefined {
    if (questionNumber <= 5) return;

    if (5 <= firstHalfScore && firstHalfScore < 12) {
      return "sensory";
    } else if (12 <= firstHalfScore && firstHalfScore < 19) {
      return "charity";
    } else if (19 <= firstHalfScore && firstHalfScore <= 25) {
      return "harmony";
    }

    throw new InvalidStateError("Score is not valid for determining a group");
  }

  function determineFlowerType(): FlowerType | undefined {
    if (questionNumber <= 10) return;
    if (group === undefined)
      throw new InvalidStateError(
        "Ran out of questions (no. > 10) but the group has not yet been determined",
      );

    const possibleTypes = FLOWER_TYPES[group];
    if (5 <= secondHalfScore && secondHalfScore <= 11) {
      return possibleTypes[0];
    } else if (12 <= secondHalfScore && secondHalfScore <= 18) {
      return possibleTypes[1];
    } else if (19 <= secondHalfScore && secondHalfScore <= 25) {
      return possibleTypes[2];
    } else {
      throw new InvalidStateError("Invalid score");
    }
  }

  function onFirstHalfAnswer(group: FlowerGroup) {
    let addBy: number | undefined = undefined;
    switch (group) {
      case "sensory":
        addBy = 1;
        break;
      case "charity":
        addBy = 3;
        break;
      case "harmony":
        addBy = 5;
        break;
    }
    setFirstHalfScore(firstHalfScore + addBy);
    setQuestionNumber(questionNumber + 1);
  }

  function onSecondHalfAnswer(typeNumber: FlowerType) {
    if (group === undefined)
      throw new Error(
        "Got second half answer while the first half is not finished",
      );

    const possibleTypes = FLOWER_TYPES[group];

    const flowerIndexInGroup = possibleTypes.indexOf(typeNumber);
    if (flowerIndexInGroup === -1)
      throw new Error("Invalid flower type for the current group " + group);

    // maps from (0, 1, 2) to (1, 3, 5)
    const pointsToAdd = flowerIndexInGroup * 2 + 1;

    setSecondHalfScore(secondHalfScore + pointsToAdd);
    setQuestionNumber(questionNumber + 1);
  }

  function onRetakeQuiz() {
    setQuestionNumber(1);
    setFirstHalfScore(0);
    setSecondHalfScore(0);
    setRestarted(true);
  }

  // saves the updated state to cookie
  useEffect(() => {
    const serialized = JSON.stringify({
      firstHalfScore,
      secondHalfScore,
      questionNumber,
    } satisfies SerializableGameState);

    document.cookie = `${GAME_STATE_COOKIE_KEY}=${encodeURI(serialized)}`;
  }, [firstHalfScore, secondHalfScore, questionNumber]);

  return (
    <>
      <div className="max-w-screen-sm w-full max-h-screen relative">
        {flowerType === undefined ? (
          <div className="">
            {group === undefined ? (
              <FirstHalfQuestions
                questionNumber={questionNumber}
                onFirstHalfAnswer={onFirstHalfAnswer}
                scenes={scenes[0]}
              />
            ) : (
              <SecondHalfQuestions
                questionNumber={questionNumber}
                group={group}
                onSecondHalfAnswer={onSecondHalfAnswer}
                scenes={[scenes[1], scenes[2], scenes[3]]}
              />
            )}
          </div>
        ) : (
          <ResultPage
            flowerType={flowerType}
            showIntro={
              restarted || !storedState || storedState.questionNumber <= 10
            }
            scenes={scenes[4]}
            onRetakeQuiz={onRetakeQuiz}
          />
        )}
      </div>
    </>
  );
};
