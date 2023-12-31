import React from "react";
import { Field, ErrorMessage } from "formik";
import TextError from "./TextError";

function SelectField(props) {
  const { label, name, options, className, ...rest } = props;
  return (
    <div className="form-control">
      <label htmlFor={name}>{label}</label>
      <Field as='select' id={name} name={name} {...rest} className={className}>
        {options.map((option) => {
          return (
            <option key={option.value} value={option.value}>
              {option.key}
            </option>
          );
        })}
      </Field>
      <ErrorMessage name={name} component={TextError} />
    </div>
  );
}

export default SelectField;
