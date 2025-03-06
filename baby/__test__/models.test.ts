import { suite, expect, test } from "vitest";
import { pureLLM, models } from "../src/models";

suite.skip("model", () => {
  test("pure model", async () => {
    const llm = pureLLM(models.stupid);
    const answer = await llm("hello");
    console.log(answer);
    expect(answer).toBeTypeOf("string");
  });
});
