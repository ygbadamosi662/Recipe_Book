import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TextError from './TextError'

function InputField(props) {
    const {name, label, className, ...rest} = props

    return (
        <div className='form-control'>
            <label htmlFor={name} >{label}</label>
            <Field id={name} name={name} {...rest} className={className}/>
            <ErrorMessage name={name} component={TextError}/>
        </div>
    )
}

export default InputField
