import { Fragment } from "react";
import { useLibraryContext } from "../../../hooks/useLibraryContext";
import { Box } from "../../Box";
import { Header } from "../../Header";
import { Answer } from "../components/Answer";
import { Question } from "../components/Question";

export default function CommonQuestionsRoute() {
  const { commonQuestions = [] } = useLibraryContext();

  return (
    <Box direction="column" gap={4}>
      <Header title="Common questions" />
      <dl>
        {commonQuestions.map((current) => (
          <Fragment key={current.id}>
            <Question id={current.id}>{current.question}</Question>
            <Answer>{current.answer}</Answer>
          </Fragment>
        ))}
      </dl>
    </Box>
  );
}
