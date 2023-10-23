import React from "react";
import InputField from "./FormElements/InputField";
import SelectField from "./FormElements/SelectField";
import CheckboxField from "./FormElements/CheckboxField";
import DatePicker from "./FormElements/DatePicker";
import TextAreaField from "./FormElements/TextAreaField"

function FormikControl(props) {
  const { control, ...rest } = props;

  switch (control) {
    case "input":
      return <InputField {...rest} />;
    case "select":
      return <SelectField {...rest} />;
    case "checkbox":
      return <CheckboxField {...rest} />;
    case "date":
      return <DatePicker {...rest}/>
    case "text-area":
      return <TextAreaField {...rest}/>
    default:
      return null;
  }
}

export default FormikControl;
