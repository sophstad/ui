import { ProcessedLogLines, SelectedLineRange } from "types/logs";
import { findLineIndex } from "utils/findLineIndex";
import { isCollapsedRow } from "utils/logRowTypes";

const getLinesInProcessedLogLinesFromSelectedLines = (
  processedLogLines: ProcessedLogLines,
  selectedLines: SelectedLineRange,
) => {
  const endingLine = selectedLines.endingLine ?? selectedLines.startingLine;
  const startingIndex = findLineIndex(
    processedLogLines,
    selectedLines.startingLine,
  );
  const endingIndex = findLineIndex(processedLogLines, endingLine);

  if (startingIndex === -1 || endingIndex === -1) return [];
  const lines: number[] = [];
  for (let i = startingIndex; i <= endingIndex; i++) {
    const line = processedLogLines[i];
    if (!isCollapsedRow(line)) {
      lines.push(line);
    }
  }
  return lines;
};

export { getLinesInProcessedLogLinesFromSelectedLines };
