export const userErrorIncompleteValue = (user) => {
    
    return `One or more required parameters were not provided:
    Required properties:
   *  first_name: A defined string was expected, but received ${user.first_name}.
   *  email: A defined string was expected, but received ${user.email}.
   *  password: A defined string was expected, but received ${user.password}.
    `
}

