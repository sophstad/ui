import { DateTimePicker, TimePicker } from "./DateTimePicker";
import {
  LeafyGreenTextInput,
  LeafyGreenTextArea,
  LeafyGreenSelect,
  LeafyGreenRadio,
  LeafyGreenRadioBox,
  LeafyGreenCheckBox,
  LeafyGreenSegmentedControl,
} from "./LeafyGreenWidgets";
import { MultiSelect } from "./MultiSelect";

const widgets = {
  DateTimeWidget: DateTimePicker,
  TextWidget: LeafyGreenTextInput,
  TextareaWidget: LeafyGreenTextArea,
  TimeWidget: TimePicker,
  CheckboxWidget: LeafyGreenCheckBox,
  SegmentedControlWidget: LeafyGreenSegmentedControl,
  SelectWidget: LeafyGreenSelect,
  RadioWidget: LeafyGreenRadio,
  RadioBoxWidget: LeafyGreenRadioBox,
  MultiSelectWidget: MultiSelect,
};

export default widgets;
