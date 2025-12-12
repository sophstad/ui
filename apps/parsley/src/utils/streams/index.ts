import { trimLogLineToMaxSize } from "@evg-ui/lib/utils/string";

export type DecodeStreamPayload = {
  result: string[];
  trimmedLines: boolean;
};

/**
 * Creates a TransformStream that splits text into lines and emits batches.
 * Emits arrays of lines (one array per chunk) to reduce async overhead.
 * @returns TransformStream that emits batches of lines
 */
const createLineSplitTransformStream = (): TransformStream<
  string,
  string[]
> => {
  let partialLine = "";

  return new TransformStream<string, string[]>({
    flush(controller) {
      if (partialLine) {
        controller.enqueue([partialLine]);
      }
    },
    transform(chunk, controller) {
      const lines = chunk.split(/\r?\n/);
      lines[0] = partialLine + lines[0];

      // Last element might be partial (no newline at end)
      partialLine = lines.pop() ?? "";

      // Emit batch of complete lines
      if (lines.length > 0) {
        controller.enqueue(lines);
      }
    },
  });
};

/**
 * Creates a TransformStream that trims lines exceeding a size limit.
 * Processes batches of lines for efficiency.
 * @param lineSizeLimit - maximum length of a line before trimming
 * @param onTrimmed - callback invoked when a line is trimmed
 * @returns TransformStream that trims oversized lines
 */
const createLineTrimTransformStream = (
  lineSizeLimit: number,
  onTrimmed?: () => void,
): TransformStream<string[], string[]> =>
  new TransformStream<string[], string[]>({
    transform(lines, controller) {
      const result = lines.map((line) => {
        if (line.length > lineSizeLimit) {
          onTrimmed?.();
          return trimLogLineToMaxSize(line, lineSizeLimit);
        }
        return line;
      });
      controller.enqueue(result);
    },
  });

/**
 * \`decodeStream\` decodes a ReadableStream into an array of strings.
 * Uses batched TransformStreams for efficient processing.
 * @param stream - ReadableStream to decode
 * @param lineSizeLimit - optional maximum length of a line before trimming
 * @returns DecodeStreamPayload with result array and trimmedLines flag
 */
const decodeStream = async (
  stream: ReadableStream,
  lineSizeLimit?: number,
): Promise<DecodeStreamPayload> => {
  let trimmedLines = false;

  let lineStream = stream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(createLineSplitTransformStream());

  // Only add trim transform if limit specified
  if (lineSizeLimit !== undefined) {
    lineStream = lineStream.pipeThrough(
      createLineTrimTransformStream(lineSizeLimit, () => {
        trimmedLines = true;
      }),
    );
  }

  // Collect batches and flatten
  const result: string[] = [];
  const reader = lineStream.getReader();

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { done, value } = await reader.read();
    if (done) break;
    result.push(...value);
  }

  return { result, trimmedLines };
};

export { decodeStream };
