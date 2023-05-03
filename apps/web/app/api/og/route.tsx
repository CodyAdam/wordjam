import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

const image = fetch(new URL("../../../public/jam.png", import.meta.url)).then(
  (res) => res.arrayBuffer()
);

// Make sure the font exists in the specified path:
const font = fetch(new URL("./Niramit-Bold.ttf", import.meta.url)).then((res) =>
  res.arrayBuffer()
);

const imageBoard = fetch(new URL("./board.png", import.meta.url)).then((res) =>
  res.arrayBuffer()
);

export async function GET(request: Request) {
  const imageData = await image;
  const imageBoardData = await imageBoard;
  const fontData = await font;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          gap: "1rem",
          backgroundImage: "linear-gradient(to bottom, #ffcf67, #d3321d)",
          fontFamily: '"Niramit"',
          position: "relative",
        }}
      >
        <img
          style={{ filter: "blur(1.5rem)" }}
          src={imageBoardData as unknown as string}
          tw="absolute h-full w-full"
        />
        <div tw="flex flex-col items-center jutify-center">
          <img tw="h-24" src={imageData as unknown as string} />
          <h1 tw={"font-bold text-9xl"}>WordJam</h1>
          <p tw="text-4xl">
            Unleash Your Inner Wordsmith and Create a Symphony of Letters!
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 600,
      fonts: [
        {
          name: "Typewriter",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}
