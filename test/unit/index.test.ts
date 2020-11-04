describe("some sample tests to see if circle CI works", () => {
  test("Does addition still work in 2020?", () => {
    expect(2 + 2).toEqual(4);
  });

  test("Does naruto uzumaki have 13 words in it", () => {
    const ninja: string = "naruto uzumaki";
    const parsedNinja = ninja.replace(" ", "");
    expect(parsedNinja.length).toBe(13);
  });
});
