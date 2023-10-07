import { it, describe, expect } from "bun:test";
import {
  ModifierParameters,
  getModifierFormatOutput,
  modifiersPlanner,
} from "../src/core/modifier";

describe("getModifierFormatOutput", () => {
  it("should return the last file format set", () => {
    // arrange

    const rawModifiers = [
      "format=xyz",
      "format=webp",
      "format=jpg",
      "enlarge=true&width=64",
      "format=png",
    ];

    // act
    const result = getModifierFormatOutput(`${rawModifiers.join("&")}&bunimg`);

    // arrange
    expect(result).toStrictEqual("png");
  });
});

describe("modifiersPlanner", () => {
  it("should return no modifier when string is empty", () => {
    // act
    const result = modifiersPlanner("");

    // assert
    expect(result).toStrictEqual([]);
  });

  it("should return width modifier parameters", () => {
    // arrange

    const rawModifiers = ["width=128", "enlarge=true&width=64", "width=8"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "width",
        width: 128,
        enlarge: false,
      },
      {
        type: "width",
        width: 64,
        enlarge: true,
      },
      {
        type: "width",
        width: 8,
        enlarge: false,
      },
    ] satisfies ModifierParameters[]);
  });

  it("should support `&` and `&amp;` modifier separator", () => {
    // arrange

    const rawModifiers = ["width=128", "enlarge=true&width=64", "width=8"];

    // act
    const result = modifiersPlanner(
      "width=128&enlarge=true&amp;width=64&width=8&amp;bunimg"
    );

    // assert
    expect(result).toStrictEqual([
      {
        type: "width",
        width: 128,
        enlarge: false,
      },
      {
        type: "width",
        width: 64,
        enlarge: true,
      },
      {
        type: "width",
        width: 8,
        enlarge: false,
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return height modifier parameters", () => {
    // arrange

    const rawModifiers = ["height=128", "enlarge=true&height=64", "height=8"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "height",
        height: 128,
        enlarge: false,
      },
      {
        type: "height",
        height: 64,
        enlarge: true,
      },
      {
        type: "height",
        height: 8,
        enlarge: false,
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return resize modifier parameters", () => {
    // arrange

    const rawModifiers = [
      "resize=128x256",
      "enlarge=true&resize=128x256",
      "resize=128x256_#f0f0f0",
      "kernel=nearest&resize=128x256",
      "fit=fit_outside&resize=128x256",
      "position=top&resize=128x256",
      "resize=64",
    ];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "resize",
        width: 128,
        height: 256,
        enlarge: false,
        kernel: undefined,
        fit: undefined,
        position: undefined,
        background: undefined,
      },
      {
        type: "resize",
        width: 128,
        height: 256,
        enlarge: true,
        kernel: undefined,
        fit: undefined,
        position: undefined,
        background: undefined,
      },
      {
        type: "resize",
        width: 128,
        height: 256,
        enlarge: false,
        kernel: undefined,
        fit: undefined,
        position: undefined,
        background: "#f0f0f0",
      },
      {
        type: "resize",
        width: 128,
        height: 256,
        enlarge: false,
        kernel: "nearest",
        fit: undefined,
        position: undefined,
        background: undefined,
      },
      {
        type: "resize",
        width: 128,
        height: 256,
        enlarge: false,
        kernel: undefined,
        fit: "fit_outside",
        position: undefined,
        background: undefined,
      },
      {
        type: "resize",
        width: 128,
        height: 256,
        enlarge: false,
        kernel: undefined,
        fit: undefined,
        position: "top",
        background: undefined,
      },
      {
        type: "resize",
        width: 64,
        height: 64,
        enlarge: false,
        kernel: undefined,
        fit: undefined,
        position: undefined,
        background: undefined,
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return trim modifier parameters", () => {
    // arrange

    const rawModifiers = ["trim"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "trim",
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return extend modifier parameters", () => {
    // arrange

    const rawModifiers = ["extend=4_8_9_10", "extend=1_2_3_4_#ff00ff"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "extend",
        top: 4,
        right: 8,
        bottom: 9,
        left: 10,
        background: undefined,
      },
      {
        type: "extend",
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
        background: "#ff00ff",
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return extract modifier parameters", () => {
    // arrange

    const rawModifiers = ["extract=42_8_12_1"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "extract",
        left: 42,
        top: 8,
        width: 12,
        height: 1,
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return rotate modifier parameters", () => {
    // arrange

    const rawModifiers = ["rotate=90"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "rotate",
        rotate: 90,
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return flip and flop modifiers parameters", () => {
    // arrange

    const rawModifiers = ["flip=true", "flop=1", "flip"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "flip",
      },
      {
        type: "flop",
      },
      {
        type: "flip",
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return sharpen modifiers parameters", () => {
    // arrange

    const rawModifiers = ["sharpen=30"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "sharpen",
        sigma: 30,
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return median modifiers parameters", () => {
    // arrange

    const rawModifiers = ["median=10"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "median",
        median: 10,
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return blur modifiers parameters", () => {
    // arrange

    const rawModifiers = ["blur=5"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "blur",
        blur: 5,
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return gamma modifiers parameters", () => {
    // arrange

    const rawModifiers = ["gamma=3"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "gamma",
        gamma: 3,
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return negate modifiers parameters", () => {
    // arrange

    const rawModifiers = ["negate"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "negate",
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return normalize modifiers parameters", () => {
    // arrange

    const rawModifiers = ["normalize"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "normalize",
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return threshold modifiers parameters", () => {
    // arrange

    const rawModifiers = ["threshold=10"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "threshold",
        threshold: 10,
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return tint modifiers parameters", () => {
    // arrange

    const rawModifiers = ["tint=#00ff00", "tint=0f0f0f"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "tint",
        color: "#00ff00",
      },
      {
        type: "tint",
        color: "0f0f0f",
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return grayscale modifiers parameters", () => {
    // arrange

    const rawModifiers = ["grayscale", "greyscale"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "grayscale",
      },
      {
        type: "grayscale",
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return modulate modifiers parameters", () => {
    // arrange

    const rawModifiers = [
      "modulate",
      "brightness=2&modulate",
      "hue=180&modulate",
      "lightness=50&modulate",
      "saturation=0,5&modulate",
      "hue=90&brightness=0,55&saturation=0.75&modulate",
    ];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "modulate",
        brightness: undefined,
        hue: undefined,
        lightness: undefined,
        saturation: undefined,
      },
      {
        type: "modulate",
        brightness: 2,
        hue: undefined,
        lightness: undefined,
        saturation: undefined,
      },
      {
        type: "modulate",
        brightness: undefined,
        hue: 180,
        lightness: undefined,
        saturation: undefined,
      },
      {
        type: "modulate",
        brightness: undefined,
        hue: undefined,
        lightness: 50,
        saturation: undefined,
      },
      {
        type: "modulate",
        brightness: undefined,
        hue: undefined,
        lightness: undefined,
        saturation: 0.5,
      },
      {
        type: "modulate",
        brightness: 0.55,
        hue: 90,
        lightness: undefined,
        saturation: 0.75,
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return format modifiers parameters", () => {
    // arrange

    const rawModifiers = ["format=png", "quality=15&format=jpeg", "format=jpg"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "format",
        format: "png",
        quality: undefined,
      },
      {
        type: "format",
        format: "jpeg",
        quality: 15,
      },
      {
        type: "format",
        format: "jpg",
        quality: undefined,
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return render modifiers parameters", () => {
    // arrange

    const rawModifiers = ["format=png", "render", "format=jpg"];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "format",
        format: "png",
        quality: undefined,
      },
      {
        type: "render",
      },
      {
        type: "format",
        format: "jpg",
        quality: undefined,
      },
    ] satisfies ModifierParameters[]);
  });

  it("should return right modifiers for this task", () => {
    // arrange

    const rawModifiers = [
      "brightness=0,5&modulate",
      "blur=2",
      "quality=80",
      "format=webp",
    ];

    // act
    const result = modifiersPlanner(`${rawModifiers.join("&")}&bunimg`);

    // assert
    expect(result).toStrictEqual([
      {
        type: "modulate",
        brightness: 0.5,
        hue: undefined,
        lightness: undefined,
        saturation: undefined,
      },
      {
        type: "blur",
        blur: 2,
      },
      {
        type: "format",
        format: "webp",
        quality: 80,
      },
    ] satisfies ModifierParameters[]);
  });
});
